import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding Living Path…");

  // ---------- Site settings ----------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heroTitle: "Living Path",
      heroSubtitle: "Himalayan Yoga · Spiritual Poetry · Nondual Teaching",
      heroTagline: "Himalayan Yoga in the here and now",
      lineageBody: `The Living Path draws from the Himalayan tradition — a current of teaching that runs from the cave-yogis of the high passes through generations of householder practitioners to the present day.

This lineage is unbroken in its essential transmission: the recognition that the breath is the bridge between body and awareness, that mantra carries the vibration of the source, and that the heart, when softened, knows itself as silence.

We are students of Swami Rama's lineage and the broader Himalayan stream that flows through Patanjali's Yoga Sutras, the Tantras, and the direct-pointing teachings of the nondual masters. Our practice braids three threads: hatha yoga as embodied prayer, pranayama as the science of attention, and meditation as the ground from which all else arises.

The path is called "living" because it is not held in books or rules. It is held in the breath of each practitioner, in the silence between thoughts, in the practical question: how shall I meet this moment, here, now, as it is?`,
      instagramUrl: "https://instagram.com/livingpath",
      substackUrl: process.env.SUBSTACK_URL ?? "https://livingpath.substack.com",
      youtubeUrl: "https://youtube.com/@livingpath",
      contactEmail: "hello@livingpath.org",
    },
  });
  console.log("  ✓ Site settings");

  // ---------- Admin users ----------
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: Role.ADMIN },
      create: { email, role: Role.ADMIN, name: email.split("@")[0] },
    });
  }
  if (adminEmails.length) console.log(`  ✓ ${adminEmails.length} admin user(s)`);

  // ---------- Teaching pages (page builder) ----------
  const teachingPages = [
    {
      slug: "teachings/spiritual-poetry",
      title: "Spiritual Poetry",
      description: "Verse as a doorway to silence — Mirabai, Rumi, Lalla, and the wordless tongue of the heart.",
      blocks: [
        {
          id: "h1",
          type: "hero",
          data: {
            title: "Spiritual Poetry",
            subtitle: "Verse as a doorway to silence",
            ctaLabel: "Join a class",
            ctaHref: "/#classes",
          },
        },
        {
          id: "p1",
          type: "prose",
          data: {
            html: `<p>Across every wisdom tradition, the awakened ones have spoken in poetry. Not because verse is decoration, but because the truth they touched would not fit in plain prose.</p><p>Mirabai sang it as devotion. Rumi danced it. Lalla walked naked through Kashmir, scattering it like seed. Hafiz teased the religious into laughter so they might forget themselves long enough to remember.</p><h2>The work we do here</h2><p>We read the great poets slowly. We write our own. We sit with a single line for an hour and let it dissolve our defenses. We learn to write from the place that does not think.</p><p>This is not a literature class. It is a practice. The poem is a doorway. The doorway is the breath. The breath is the threshold of the unsayable.</p>`,
          },
        },
        {
          id: "q1",
          type: "quote",
          data: {
            text: "I have lived on the lip of insanity, wanting to know reasons, knocking on a door. It opens. I've been knocking from the inside.",
            attribution: "Rumi",
          },
        },
      ],
      status: "published",
    },
    {
      slug: "teachings/breath-as-teacher",
      title: "Breath as Teacher",
      description: "Pranayama, the science of attention, and the breath as the most honest teacher we will ever meet.",
      blocks: [
        {
          id: "h1",
          type: "hero",
          data: {
            title: "Breath as Teacher",
            subtitle: "The most honest teacher you will ever meet",
            ctaLabel: "Join a class",
            ctaHref: "/#classes",
          },
        },
        {
          id: "p1",
          type: "prose",
          data: {
            html: `<p>The breath does not lie. It tells you exactly where you are — every contraction, every grasping, every release.</p><p>In the Himalayan tradition, pranayama is not a set of techniques to perform. It is a slow study of the most intimate movement in the body: the rise and fall that began at birth and will end at death, and is happening, right now, without your having to do it.</p><h2>What we practice</h2><p>We work with diaphragmatic breathing as the ground of all else. From there: nadi shodhana to balance the channels, ujjayi to gather attention, kapalabhati to clear the field, and the long retentions that open the doors of the deeper sheaths.</p><p>But beneath every technique is the same instruction: be with the breath as it is. Let it teach you.</p>`,
          },
        },
        {
          id: "q1",
          type: "quote",
          data: {
            text: "When the breath wanders, the mind also is unsteady. But when the breath is calmed, the mind too will be still.",
            attribution: "Hatha Yoga Pradipika",
          },
        },
      ],
      status: "published",
    },
    {
      slug: "teachings/nondual-inquiry",
      title: "Nondual Inquiry",
      description: "The direct path of self-investigation — who is the one who is seeking?",
      blocks: [
        {
          id: "h1",
          type: "hero",
          data: {
            title: "Nondual Inquiry",
            subtitle: "Who is the one who is seeking?",
            ctaLabel: "Join a class",
            ctaHref: "/#classes",
          },
        },
        {
          id: "p1",
          type: "prose",
          data: {
            html: `<p>At the heart of every spiritual tradition is a single question, asked in a thousand languages: <em>who am I?</em></p><p>Not the role, not the story, not the body that ages, not even the meditator who sits down to meditate — but the awareness in which all of these arise.</p><h2>The inquiry</h2><p>Nondual inquiry is the direct method. We do not believe our way to truth; we look. We turn the attention back upon itself and ask: who is aware? Who is reading these words? What is here before any thought arises?</p><p>This is the path of Ramana Maharshi, of Nisargadatta, of the Kashmir Shaiva masters, of the great forest sages. It is not separate from yoga; it is yoga's deepest fruit. The asana settles the body, the breath settles the mind, and inquiry reveals the silent ground.</p><p>We meet weekly to sit, to look, and to share what is found. There is nothing to believe. There is only what is.</p>`,
          },
        },
        {
          id: "q1",
          type: "quote",
          data: {
            text: "The mind turned outward results in thoughts and objects. Turned inward, it becomes itself the Self.",
            attribution: "Ramana Maharshi",
          },
        },
      ],
      status: "published",
    },
  ];

  for (const page of teachingPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        description: page.description,
        blocks: page.blocks,
        status: page.status,
        publishedAt: new Date(),
      },
      create: {
        ...page,
        publishedAt: new Date(),
      },
    });
  }
  console.log("  ✓ Teaching pages");

  // ---------- Sample essays ----------
  const sampleEssays = [
    {
      slug: "the-breath-that-was-already-here",
      title: "The Breath That Was Already Here",
      excerpt: "Notes on the morning practice and what it reveals about the rest of the day.",
      contentHtml: `<p>I sat down this morning at five. The room was dark. The breath was already there, of course — it had been all night, doing its work without me.</p><p>This is the trick the breath plays on the seeker: it makes you think you have to <em>do</em> something. You sit, you arrange the body, you set the timer. You count. You modulate. You think, "now I am practicing pranayama."</p><p>And then, if the practice is honest, there is a moment when you notice: the breath was here before you began. It will be here after you stop. You did not start it. You will not finish it. It is older than your seeking.</p><p>The practice is not to make the breath happen. It is to remember that it is happening, and to soften enough to let it.</p>`,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      coverImage: null,
    },
    {
      slug: "what-the-cave-yogis-knew",
      title: "What the Cave Yogis Knew",
      excerpt: "On lineage, transmission, and why the Himalayas are not a metaphor.",
      contentHtml: `<p>The cave yogis of the high Himalayas were not romantics. They were practical people doing practical work in conditions most of us would not survive a week in.</p><p>They knew — by direct experience, not by reading — that the body is a field of energy, that the breath organizes that field, and that attention is the lever that moves it all. They did not call this "spirituality." They called it sadhana: the work.</p><p>What they passed down was not a philosophy. It was a set of instructions, refined over generations, for one task: meeting your own awareness without flinching.</p><p>We are the inheritors of those instructions. We sit in heated rooms, with apps on our phones, and we forget how strange and precious it is that the techniques still work. The breath still settles the mind. The mantra still steadies the heart. The silence still opens.</p>`,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      coverImage: null,
    },
    {
      slug: "the-question-that-undoes-itself",
      title: "The Question That Undoes Itself",
      excerpt: "Self-inquiry, in plain language, for people who are tired of seeking.",
      contentHtml: `<p>"Who am I?" is not a question with an answer. It is a question that, asked sincerely enough, undoes the asker.</p><p>Try it now. Not as a thought — as a turning. Whatever you take yourself to be, look at it. Is it the body? You can observe the body. So you are not the body — you are what observes it.</p><p>Is it the mind? You can observe thoughts coming and going. So you are not the mind — you are what observes it.</p><p>Keep going. Keep peeling. What remains, when there is nothing left to peel away, is the one thing you can never observe — because it is the observing itself.</p><p>That is what you are. That is what was always here. The question was never separate from the answer.</p>`,
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      coverImage: null,
    },
  ];

  for (const essay of sampleEssays) {
    await prisma.essay.upsert({
      where: { slug: essay.slug },
      update: {},
      create: { ...essay, source: "native" },
    });
  }
  console.log("  ✓ Sample essays");

  // ---------- Sample class events ----------
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7));
  nextMonday.setHours(7, 0, 0, 0);

  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
  nextWednesday.setHours(18, 30, 0, 0);

  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  nextSaturday.setHours(9, 0, 0, 0);

  const workshopDate = new Date(now);
  workshopDate.setDate(now.getDate() + 21);
  workshopDate.setHours(10, 0, 0, 0);

  const classes = [
    {
      title: "Morning Hatha & Pranayama",
      description: "A grounding morning practice: gentle hatha to wake the body, followed by 30 minutes of pranayama and seated meditation. Members only.",
      startsAt: nextMonday,
      endsAt: new Date(nextMonday.getTime() + 75 * 60 * 1000),
      isWorkshop: false,
      recurring: "FREQ=WEEKLY;BYDAY=MO",
      location: "Online (Zoom)",
      zoomUrl: "https://zoom.us/j/example",
    },
    {
      title: "Evening Nondual Inquiry",
      description: "A weekly sitting and dialogue group for the practice of self-inquiry. We sit, we look, we share. Members only.",
      startsAt: nextWednesday,
      endsAt: new Date(nextWednesday.getTime() + 90 * 60 * 1000),
      isWorkshop: false,
      recurring: "FREQ=WEEKLY;BYDAY=WE",
      location: "Online (Zoom)",
      zoomUrl: "https://zoom.us/j/example",
    },
    {
      title: "Saturday Sangha — Open Practice",
      description: "Our weekly community gathering. All practice levels welcome. Themed each week — see the calendar for details.",
      startsAt: nextSaturday,
      endsAt: new Date(nextSaturday.getTime() + 120 * 60 * 1000),
      isWorkshop: false,
      recurring: "FREQ=WEEKLY;BYDAY=SA",
      location: "Online (Zoom)",
      zoomUrl: "https://zoom.us/j/example",
    },
    {
      title: "Weekend Workshop: The Spiral Breath",
      description: "A half-day immersion into the spiral pranayamas of the Himalayan tradition. Open to all — no membership required.\n\nWe will explore nadi shodhana in depth, work with bhastrika and kapalabhati safely, and end with a long sitting in stillness.",
      startsAt: workshopDate,
      endsAt: new Date(workshopDate.getTime() + 4 * 60 * 60 * 1000),
      isWorkshop: true,
      priceCents: 6500,
      capacity: 30,
      recurring: null,
      location: "Online (Zoom)",
      zoomUrl: "https://zoom.us/j/example",
    },
  ];

  for (const c of classes) {
    const existing = await prisma.classEvent.findFirst({
      where: { title: c.title, startsAt: c.startsAt },
    });
    if (!existing) {
      await prisma.classEvent.create({ data: c });
    }
  }
  console.log("  ✓ Sample classes");

  console.log("✓ Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
