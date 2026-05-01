import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, isSameDay, isValid, parseISO } from 'date-fns';
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
  const { walks, clients, finishWalk, startWalk } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const [finishConfirmVisible, setFinishConfirmVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const walk = walks.find((w) => w.id === route.params.walkId);
  const isScheduled = walk?.status === 'scheduled';
  const isInProgress = walk?.status === 'in_progress';

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

  if (!walk) return null;

  if (walk.status === 'done') {
    const clientRow = clients.find((c) => c.id === walk.clientId);
    const dogsRow = clientRow
      ? clientRow.dogs.filter((d) => walk.dogIds.includes(d.id))
      : [];
    return (
      <CompletedWalkView
        walk={walk}
        clientRow={clientRow}
        dogsRow={dogsRow}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onBack={() => navigation.goBack()}
        onOpenDog={(dogId) =>
          clientRow
            ? navigation.navigate("DogDetail", {
                clientId: clientRow.id,
                dogId,
                allowDelete: false,
              })
            : undefined
        }
      />
    );
  }

  if (walk.status === 'cancelled') {
    const clientRow = clients.find((c) => c.id === walk.clientId);
    const dogsRow = clientRow
      ? clientRow.dogs.filter((d) => walk.dogIds.includes(d.id))
      : [];
    return (
      <CancelledWalkView
        walk={walk}
        clientRow={clientRow}
        dogsRow={dogsRow}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onBack={() => navigation.goBack()}
      />
    );
  }

  const client = clients.find((c) => c.id === walk.clientId);
  if (!client) return null;

  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  const dog = dogs[0];

  const scheduledAtParsed = walk.scheduledAt ? parseISO(walk.scheduledAt) : null;
  const scheduleWhen =
    scheduledAtParsed && isValid(scheduledAtParsed)
      ? format(scheduledAtParsed, "EEE, MMM d '.' h:mm a")
      : '—';

  const isLateToStart = isWalkLateToStart(walk);
  const windowEnd = getWalkWindowEndTime(walk);
  const endTimeLabel =
    windowEnd && isValid(windowEnd) ? format(windowEnd, "h:mm a '.' MMM d") : '—';

  const handleStartWalk = async () => {
    if (!isSameDay(parseISO(walk.scheduledAt), new Date())) {
      Alert.alert(
        'Scheduled for another day',
        'This walk can be started on its scheduled day, or reschedule the walk for today.'
      );
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
    try {
      await finishWalk(walk.id);
      setFinishConfirmVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not finish walk.');
    } finally {
      setFinishing(false);
    }
  };

  const notesText = [
    client.keyLocation && `Client notes: ${client.keyLocation}`,
    dog?.medical && dog.medical,
    dog?.vet && `Vet: ${dog.vet}${dog.vetPhone ? ` (${dog.vetPhone})` : ''}`,
  ]
    .filter(Boolean)
    .join('\n');

  const billingTotal = walkCharge(walk, client);
  const walkPerDogMap = walk.perDogPrices;
  const billingUsesPerDog =
    walkPerDogMap != null && Object.keys(walkPerDogMap).length > 0;
  const billingDogCount = walkDogCount(walk);

  return (
    <>
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

      <FinishWalkSheet
        visible={finishConfirmVisible}
        elapsedSeconds={elapsed}
        plannedMinutes={walk.durationMinutes}
        clientName={client.name}
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
