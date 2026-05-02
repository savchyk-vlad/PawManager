import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { ScheduledAnotherDayModal } from '../../components/ScheduledAnotherDayModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, isSameDay, isValid, parseISO } from "date-fns";
import { getWalkWindowEndTime, isWalkLateToStart } from '../../lib/missedWalksService';
import { useAppStore } from '../../store';
import { RootStackParamList } from '../../navigation';
import { walkCharge, walkDogCount } from '../../lib/walkMetrics';
import { CancelledWalkView } from './components/CancelledWalkView';
import { ActiveWalkMainView } from './components/ActiveWalkMainView';
import { CompletedWalkView } from './components/CompletedWalkView';
import { FinishWalkSheet } from '../../components/FinishWalkSheet';

type Route = RouteProp<RootStackParamList, 'ActiveWalk'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWalkScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { walks, clients, walksLoading, finishWalk, startWalk } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const [finishConfirmVisible, setFinishConfirmVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [anotherDayModalVisible, setAnotherDayModalVisible] = useState(false);

  const walk = walks.find((w) => w.id === route.params.walkId);
  const isScheduled = walk?.status === 'scheduled';
  const isInProgress = walk?.status === 'in_progress';

  useEffect(() => {
    if (walksLoading) return;
    if (walk) return;
    navigation.navigate("Tabs", { screen: "Walks" });
  }, [navigation, walk, walksLoading]);

  useEffect(() => {
    if (!isInProgress) {
      setElapsed(0);
      return;
    }
    const startedAt = walk?.startedAt;
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const startedAtMs = new Date(startedAt).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isInProgress, walk?.startedAt, walk?.id]);

  if (!walk) {
    if (walksLoading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0e0e0c',
          }}>
          <ActivityIndicator color="#5CAF72" />
        </View>
      );
    }
    return null;
  }

  const client = clients.find((c) => c.id === walk.clientId);
  const dogs = client ? client.dogs.filter((d) => walk.dogIds.includes(d.id)) : [];
  const dog = dogs[0];

  const handleStartWalk = async () => {
    const scheduled = walk.scheduledAt ? parseISO(walk.scheduledAt) : null;
    if (scheduled && isValid(scheduled) && !isSameDay(scheduled, new Date())) {
      setAnotherDayModalVisible(true);
      return;
    }
    try {
      await startWalk(walk.id);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not start walk.');
    }
  };

  const handleFinish = () => setFinishConfirmVisible(true);

  const confirmFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    setFinishConfirmVisible(false);
            try {
              await finishWalk(walk.id);
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not finish walk.');
    } finally {
      setFinishing(false);
    }
  };

  let content: React.ReactNode = null;
  let billingTotal = 0;

  if (walk.status === 'done') {
    content = (
      <CompletedWalkView
        walk={walk}
        clientRow={client}
        dogsRow={dogs}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onBack={() => navigation.goBack()}
        onOpenDog={(dogId) =>
          client
            ? navigation.navigate("DogDetail", {
                clientId: client.id,
                dogId,
                allowDelete: false,
              })
            : undefined
        }
      />
    );
    billingTotal = walkCharge(walk, client);
  } else if (walk.status === 'cancelled') {
    content = (
      <CancelledWalkView
        walk={walk}
        clientRow={client}
        dogsRow={dogs}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onBack={() => navigation.goBack()}
      />
    );
    billingTotal = walkCharge(walk, client);
  } else if (client) {
    const scheduledAtParsed = walk.scheduledAt ? parseISO(walk.scheduledAt) : null;
    const scheduleWhen =
      scheduledAtParsed && isValid(scheduledAtParsed)
        ? format(scheduledAtParsed, "EEE, MMM d '.' h:mm a")
        : '—';

    const isLateToStart = isWalkLateToStart(walk);
    const windowEnd = getWalkWindowEndTime(walk);
    const endTimeLabel =
      windowEnd && isValid(windowEnd) ? format(windowEnd, "h:mm a '.' MMM d") : '—';

  const notesText = [
      client.keyLocation && `Client notes: ${client.keyLocation}`,
    dog?.medical && dog.medical,
    dog?.vet && `Vet: ${dog.vet}${dog.vetPhone ? ` (${dog.vetPhone})` : ''}`,
    ]
      .filter(Boolean)
      .join('\n');

    billingTotal = walkCharge(walk, client);
  const walkPerDogMap = walk.perDogPrices;
  const billingUsesPerDog =
    walkPerDogMap != null && Object.keys(walkPerDogMap).length > 0;
  const billingDogCount = walkDogCount(walk);

    content = (
      <ActiveWalkMainView
        walk={walk}
        client={client}
        dogs={dogs}
        isScheduled={isScheduled}
        isInProgress={isInProgress}
        elapsedLabel={formatTime(elapsed)}
        scheduleWhen={scheduleWhen}
        isLateToStart={isLateToStart}
        endTimeLabel={endTimeLabel}
        notesText={notesText}
        billingTotal={billingTotal}
        billingUsesPerDog={billingUsesPerDog}
        billingDogCount={billingDogCount}
        walkPerDogMap={walkPerDogMap}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onBack={() => navigation.goBack()}
        onEdit={() => navigation.navigate('EditWalk', { walkId: walk.id })}
        onStartWalk={handleStartWalk}
        onFinishWalk={handleFinish}
        onOpenDog={(dogId) =>
          navigation.navigate("DogDetail", {
            clientId: client.id,
            dogId,
            allowDelete: false,
          })
        }
      />
    );
  }

  return (
    <>
      {content}

      <ScheduledAnotherDayModal
        visible={anotherDayModalVisible}
        onDismiss={() => setAnotherDayModalVisible(false)}
        onReschedule={() => {
          setAnotherDayModalVisible(false);
          navigation.navigate('EditWalk', { walkId: walk.id });
        }}
      />

      <FinishWalkSheet
        visible={finishConfirmVisible}
        elapsedSeconds={elapsed}
        plannedMinutes={walk.durationMinutes}
        clientName={client?.name ?? '—'}
        dogsLabel={dogs.length > 1 ? 'Dogs' : 'Dog'}
        dogsValue={
          dogs.length <= 1
            ? (dogs[0]?.name ?? '—')
            : dogs.map((d) => d.name).join(', ')
        }
        totalAmount={billingTotal}
        loading={finishing}
        onConfirm={confirmFinish}
        onCancel={() => {
          if (!finishing) setFinishConfirmVisible(false);
        }}
      />
    </>
  );
}
