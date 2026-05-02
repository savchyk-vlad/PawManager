import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { onboarding } from "./onboardingTheme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/OnboardingNavigator";

const appIcon = require("../../../assets/icon.png");

type Props = NativeStackScreenProps<OnboardingStackParamList, "Onboarding"> & {
  onDone: () => void;
};

type Slide = {
  key: string;
  title?: string;
  body?: string;
  cta: string;
};

const SLIDES: Slide[] = [
  { key: "splash", cta: "Next" },
  {
    key: "problem",
    title: "Sound familiar?",
    body: "Running your business across 4 different apps is exhausting. There's a better way.",
    cta: "Next",
  },
  {
    key: "clients",
    title: "Every dog.\nEvery detail.",
    body: "Client profiles, dog notes, vet info, and gate codes — all one tap away.",
    cta: "Next",
  },
  {
    key: "schedule",
    title: "Your day,\norganized.",
    body: "30-min reminders before every walk. Set recurring schedules once — forget about it.",
    cta: "Next",
  },
  {
    key: "payments",
    title: "Never miss\na payment.",
    body: "See exactly who owes what. Automatic reminders after 7 days. Your money, yours.",
    cta: "Get started",
  },
];

export default function OnboardingScreen({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const c = onboarding.colors;
  const screenW = Dimensions.get("window").width;

  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx]!;
  const carouselRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (slide.key !== "splash") return;

    const timer = setTimeout(() => {
      setIdx(1);
    }, 1400);

    return () => clearTimeout(timer);
  }, [slide.key]);

  const dots = useMemo(() => {
    // Match the HTML: dots appear for screens 2..5.
    if (idx === 0) return null;
    return (
      <View style={s.dots}>
        {Array.from({ length: 4 }, (_, i) => {
          const inputRange = [
            (i - 1) * screenW,
            i * screenW,
            (i + 1) * screenW,
          ];
          const w = scrollX.interpolate({
            inputRange,
            outputRange: [7, 22, 7],
            extrapolate: "clamp",
          });
          const bg = scrollX.interpolate({
            inputRange,
            outputRange: [c.bg3, c.accent, c.bg3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[
                s.dot,
                {
                  width: w,
                  backgroundColor: bg as any,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }, [screenW, scrollX, c.accent, c.bg3]);

  const onSkip = () => onDone();

  const contentSlides = useMemo(() => SLIDES.slice(1), []);
  const pageIndex = Math.max(0, idx - 1);

  return (
    <View
      style={[
        s.safe,
        {
          paddingTop: slide.key === "splash" ? 0 : insets.top,
          backgroundColor: c.bg,
        },
      ]}>
      {slide.key === "splash" ? (
        <Pressable style={{ flex: 1 }} onPress={() => setIdx(1)}>
          <LinearGradient
            colors={["#0E1A11", "#122B18", "#1A4025"]}
            start={{ x: 0.1, y: 0.0 }}
            end={{ x: 0.9, y: 1.0 }}
            style={s.splashWrap}>
            <View style={s.splashGlowA} pointerEvents="none" />
            <View style={s.splashGlowB} pointerEvents="none" />
            <Image source={appIcon} style={s.appIcon} resizeMode="contain" />
            <Text style={s.splashTitle}>Paw{"\n"}Manager</Text>
            <Text style={s.splashSub}>Dog Walking Business App</Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <View
          style={[
            s.inner,
            {
              paddingBottom: insets.bottom + 32,
            },
          ]}>
          <View style={[s.topRow, { paddingHorizontal: 26 }]}>
            <View style={{ width: 64 }} />
            <TouchableOpacity onPress={onSkip} activeOpacity={0.8}>
              <Text style={[s.skip, { color: c.text3 }]}>Skip</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: pageIndex * screenW, y: 0 }}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              scrollX.setValue(x);
              const page = Math.max(
                0,
                Math.min(contentSlides.length - 1, Math.round(x / screenW)),
              );
              const nextIdx = page + 1;
              if (nextIdx !== idx) setIdx(nextIdx);
            }}
            style={{ flex: 1 }}>
            {contentSlides.map((sl) => (
              <View key={sl.key} style={{ width: screenW, paddingHorizontal: 26 }}>
                <View style={s.illusWrap}>
                  {sl.key === "problem" ? <ProblemIllustration /> : null}
                  {sl.key === "clients" ? <ClientsIllustration /> : null}
                  {sl.key === "schedule" ? <ScheduleIllustration /> : null}
                  {sl.key === "payments" ? <PaymentsIllustration /> : null}
                </View>
                <View style={s.copy}>
                  <Text style={[s.title, { color: c.text }]}>{sl.title}</Text>
                  <Text style={[s.body, { color: c.text2 }]}>{sl.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[s.navRow, { paddingHorizontal: 26 }]}>
            <View style={s.dotsSlot}>{dots}</View>
            <TouchableOpacity
              style={[
                s.btn,
                {
                  backgroundColor: c.accent,
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                },
              ]}
              onPress={() => {
                if (idx >= SLIDES.length - 1) {
                  onDone();
                  return;
                }
                const nextPage = Math.min(contentSlides.length - 1, pageIndex + 1);
                carouselRef.current?.scrollTo({
                  x: nextPage * screenW,
                  animated: true,
                });
              }}
              activeOpacity={0.9}>
              <Text style={s.btnText}>{slide.cta} →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  const c = onboarding.colors;
  const r = onboarding.radius;
  return (
    <View
      style={[
        {
          backgroundColor: c.bg2,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
          borderRadius: r.rSm,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

function ProblemIllustration() {
  const c = onboarding.colors;
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <View style={{ transform: [{ scale: 1.32 }] }}>
        <View style={{ width: 260, height: 210 }}>
          <Card
            style={[
              s.floatCard,
              { transform: [{ rotate: "-5deg" }], left: 0, top: -20 },
            ]}>
            <Text style={[s.floatHdr, { color: c.teal }]}>GOOGLE CALENDAR</Text>
            <Text style={[s.floatBody, { color: c.text2 }]}>
              Mon: Max @ 10am?{"\n"}Tue: Biscuit maybe 🤷
            </Text>
          </Card>
          <Card
            style={[
              s.floatCard,
              { transform: [{ rotate: "5deg" }], right: -20, top: 46 },
            ]}>
            <Text style={[s.floatHdr, { color: "#5680FF" }]}>VENMO</Text>
            <Text style={[s.floatBody, { color: c.text2 }]}>
              Who paid me?? 😅
            </Text>
          </Card>
          <Card
            style={[
              s.floatCard,
              { transform: [{ rotate: "4deg" }], left: 4, bottom: 20 },
            ]}>
            <Text style={[s.floatHdr, { color: c.amber }]}>PAPER NOTEBOOK</Text>
            <Text style={[s.floatBody, { color: c.text2 }]}>
              Bear gate code: 48??{"\n"}or was it 84… 😬
            </Text>
          </Card>
          <Card
            style={[
              s.floatCard,
              { transform: [{ rotate: "-8deg" }], right: -20, bottom: -12 },
            ]}>
            <Text style={[s.floatHdr, { color: "#25D265" }]}>WHATSAPP</Text>
            <Text style={[s.floatBody, { color: c.text2 }]}>47 unread 😩</Text>
          </Card>
        </View>
      </View>
    </View>
  );
}

function ClientsIllustration() {
  const c = onboarding.colors;
  const r = onboarding.radius;
  return (
    <View style={{ width: "100%", alignItems: "center", gap: 10 }}>
      <Card style={[s.bigCard, { width: "100%" }]}>
        <View style={s.dogRow}>
          <View
            style={[
              s.dogAvatar,
              {
                backgroundColor: c.accentDim,
                borderColor: "rgba(74,224,112,0.15)",
              },
            ]}>
            <Text style={{ fontSize: 22 }}>🐶</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.dogName, { color: c.text }]}>Max</Text>
            <Text style={[s.dogMeta, { color: c.text3 }]}>
              Labrador · 4 yrs · 65 lbs
            </Text>
          </View>
        </View>
        <View style={s.tagsRow}>
          <View style={[s.tag, { backgroundColor: c.accentDim }]}>
            <Text style={[s.tagText, { color: c.accent }]}>Friendly</Text>
          </View>
          <View style={[s.tag, { backgroundColor: c.accentDim }]}>
            <Text style={[s.tagText, { color: c.accent }]}>Good on leash</Text>
          </View>
          <View style={[s.tag, { backgroundColor: c.amberDim }]}>
            <Text style={[s.tagText, { color: c.amber }]}>Pulls near park</Text>
          </View>
        </View>
        <View
          style={[
            s.noteBox,
            {
              backgroundColor: c.bg3,
              borderRadius: r.rSm,
              borderColor: c.borderMd,
            },
          ]}>
          <Text style={[s.noteText, { color: c.text2 }]}>
            🔑 Key under blue pot · Gate: 4821{"\n"}🏥 Vet: Dr. Kim (555-0142)
          </Text>
        </View>
        <View style={s.cardFooter}>
          <Text style={[s.owner, { color: c.text3 }]}>Sarah Johnson</Text>
          <Text style={[s.price, { color: c.accent }]}>$25 / walk</Text>
        </View>
      </Card>
      <Card style={[s.peekCard, { width: "92%" }]}>
        <Text style={{ fontSize: 18 }}>🐕</Text>
        <Text style={[s.peekName, { flex: 1, color: c.text }]}>Biscuit</Text>
        <Text style={[s.peekOwner, { color: c.text3 }]}>Mike Torres</Text>
      </Card>
    </View>
  );
}

function ScheduleIllustration() {
  const c = onboarding.colors;
  const r = onboarding.radius;
  return (
    <View style={{ width: "100%", alignItems: "center", gap: 10 }}>
      <Card style={[s.notify, { width: "100%" }]}>
        <View style={s.notifyIcon}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.notifyTitle, { color: c.text }]}>PawManager</Text>
          <Text style={[s.notifyText, { color: c.text2 }]}>
            Max (Labrador) in 30 min — Sarah Johnson, 1420 Pine St
          </Text>
        </View>
      </Card>

      <Card style={[s.walkCard, { width: "100%" }]}>
        <View style={s.timeCol}>
          <Text style={[s.timeVal, { color: c.text }]}>10:00</Text>
          <Text style={[s.timeAp, { color: c.text3 }]}>AM</Text>
        </View>
        <View style={[s.vLine, { backgroundColor: c.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[s.walkDog, { color: c.text }]}>Max</Text>
          <Text style={[s.walkMeta, { color: c.text3 }]}>
            Sarah Johnson · 30 min
          </Text>
        </View>
        <View style={[s.startPill, { backgroundColor: c.accent }]}>
          <Text style={s.startPillText}>START</Text>
        </View>
      </Card>

      <Card style={[s.walkCard, { width: "100%" }]}>
        <View style={s.timeCol}>
          <Text style={[s.timeVal, { color: c.text }]}>2:00</Text>
          <Text style={[s.timeAp, { color: c.text3 }]}>PM</Text>
        </View>
        <View style={[s.vLine, { backgroundColor: c.borderMd }]} />
        <View style={{ flex: 1 }}>
          <Text style={[s.walkDog, { color: c.text }]}>Biscuit</Text>
          <Text style={[s.walkMeta, { color: c.text3 }]}>
            Mike Torres · 45 min
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: c.tealDim }]}>
          <Text style={[s.statusPillText, { color: c.teal }]}>Sched</Text>
        </View>
      </Card>

      <View
        style={[
          s.recurring,
          {
            backgroundColor: c.amberDim,
            borderColor: "rgba(240,160,58,0.18)",
            borderRadius: r.rSm,
          },
        ]}>
        <Text style={{ fontSize: 16 }}>🔁</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.recurringTitle, { color: c.amber }]}>
            Recurring walk active
          </Text>
          <Text style={[s.recurringSub, { color: "rgba(240,160,58,0.65)" }]}>
            Mon · Wed · Fri — set it once, done
          </Text>
        </View>
      </View>
    </View>
  );
}

function PaymentsIllustration() {
  const c = onboarding.colors;
  const r = onboarding.radius;
  return (
    <View style={{ width: "100%", alignItems: "center", gap: 10 }}>
      <LinearGradient
        colors={["#0D2414", "#163B1F", "#1D4F28"]}
        start={{ x: 0.0, y: 0.1 }}
        end={{ x: 1.0, y: 1.0 }}
        style={[
          s.earnings,
          {
            borderRadius: r.r,
            borderColor: "rgba(74,224,112,0.15)",
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
          },
        ]}>
        <Text style={[s.earningsHdr, { color: "rgba(74,224,112,0.6)" }]}>
          THIS MONTH
        </Text>
        <Text style={[s.earningsVal, { color: c.text }]}>$1,840</Text>
        <View style={s.growthPill}>
          <Text style={[s.growthText, { color: c.accent }]}>
            ↑ 23% vs last month
          </Text>
        </View>
      </LinearGradient>

      <Card style={{ width: "100%", overflow: "hidden" }}>
        <View
          style={[s.unpaidHdr, { backgroundColor: "rgba(240,85,85,0.08)" }]}>
          <Text style={[s.unpaidHdrText, { color: c.red }]}>UNPAID · $225</Text>
        </View>
        <View style={s.unpaidRow}>
          <View>
            <Text style={[s.unpaidName, { color: c.text }]}>Dave Park</Text>
            <Text style={[s.unpaidMeta, { color: c.text3 }]}>3 walks</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Text style={[s.unpaidAmt, { color: c.red }]}>$90</Text>
            <View style={[s.markPaidPill, { backgroundColor: c.accent }]}>
              <Text style={s.markPaidText}>Mark paid</Text>
            </View>
          </View>
        </View>
        <View style={[s.unpaidRow, { borderBottomWidth: 0 }]}>
          <View>
            <Text style={[s.unpaidName, { color: c.text }]}>Rachel Lee</Text>
            <Text style={[s.unpaidMeta, { color: c.text3 }]}>5 walks</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Text style={[s.unpaidAmt, { color: c.red }]}>$125</Text>
            <View style={[s.markPaidPill, { backgroundColor: c.accent }]}>
              <Text style={s.markPaidText}>Mark paid</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card
        style={[
          s.zeroCard,
          {
            backgroundColor: c.bg3,
            borderColor: c.borderMd,
            borderRadius: r.rSm,
          },
        ]}>
        <Text style={{ fontSize: 18 }}>🚫</Text>
        <Text style={[s.zeroText, { color: c.text }]}>
          Zero commission. <Text style={{ color: c.accent }}>Zero.</Text>
        </Text>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1, paddingTop: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  skip: { fontSize: 13, fontWeight: "500" },

  // Splash
  splashWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  splashGlowA: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(92,175,114,0.10)",
  },
  splashGlowB: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(92,175,114,0.07)",
  },
  appIcon: {
    width: 160,
    height: 160,
    marginBottom: 26,
    borderRadius: 36,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: "#F0F0F2",
    letterSpacing: -1.2,
    lineHeight: 42,
    textAlign: "center",
  },
  splashSub: {
    fontSize: 14,
    color: "rgba(240,240,242,0.45)",
    marginTop: 10,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  // Content
  illusWrap: {
    flex: 1,
    justifyContent: "center",
    minHeight: Math.min(340, Dimensions.get("window").height * 0.42),
  },
  copy: { marginTop: 0, marginBottom: 28 },
  title: {
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 25,
    fontWeight: "400",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
  },
  dotsSlot: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  btn: { borderRadius: 999 },
  btnText: {
    color: "#0A1A0F",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.1,
  },

  // Dots
  dots: { flexDirection: "row", gap: 7, alignItems: "center" },
  dot: { height: 7, borderRadius: 99 },
  dotActive: { width: 22, backgroundColor: "#4AE070" },
  dotInactive: { width: 7, backgroundColor: "#1F2127" },

  // Shared cards
  floatCard: {
    position: "absolute",
    width: 184,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  floatHdr: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  floatBody: { fontSize: 12, lineHeight: 18, fontWeight: "400" },

  // Clients
  bigCard: { padding: 16 },
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  dogAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dogName: { fontSize: 17, fontWeight: "700" },
  dogMeta: { fontSize: 12, marginTop: 2, fontWeight: "400" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: "600" },
  noteBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  noteText: { fontSize: 12, lineHeight: 18, fontWeight: "400" },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  owner: { fontSize: 12, fontWeight: "400" },
  price: { fontSize: 14, fontWeight: "700" },
  peekCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    opacity: 0.5,
  },
  peekName: { fontSize: 14, fontWeight: "600" },
  peekOwner: { fontSize: 12, fontWeight: "400" },

  // Schedule
  notify: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  notifyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1A3D25",
    borderWidth: 1,
    borderColor: "rgba(74,224,112,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifyTitle: { fontSize: 12, fontWeight: "700" },
  notifyText: { fontSize: 11, marginTop: 3, lineHeight: 16, fontWeight: "400" },
  walkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  timeCol: { width: 44, alignItems: "center" },
  timeVal: { fontSize: 14, fontWeight: "700" },
  timeAp: { fontSize: 9, fontWeight: "600", marginTop: 1 },
  vLine: { width: 2, height: 38, borderRadius: 2 },
  walkDog: { fontSize: 14, fontWeight: "600" },
  walkMeta: { fontSize: 11, marginTop: 2, fontWeight: "400" },
  startPill: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  startPillText: { color: "#0A1A0F", fontSize: 12, fontWeight: "900" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusPillText: { fontSize: 10, fontWeight: "900" },
  recurring: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  recurringTitle: { fontSize: 13, fontWeight: "600" },
  recurringSub: { fontSize: 11, marginTop: 2, fontWeight: "400" },

  // Payments
  earnings: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
  },
  earningsHdr: { fontSize: 11, fontWeight: "600", letterSpacing: 0.6 },
  earningsVal: {
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 6,
  },
  growthPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(74,224,112,0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  growthText: { fontSize: 11, fontWeight: "700" },
  unpaidHdr: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  unpaidHdrText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  unpaidRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  unpaidName: { fontSize: 14, fontWeight: "600" },
  unpaidMeta: { fontSize: 11, marginTop: 2, fontWeight: "400" },
  unpaidAmt: { fontSize: 15, fontWeight: "700" },
  markPaidPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  markPaidText: { fontSize: 10, fontWeight: "900", color: "#0A1A0F" },
  zeroCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  zeroText: { fontSize: 13, fontWeight: "600" },
});
