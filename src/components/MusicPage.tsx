"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";
import styles from "./MusicPage.module.css";

const spotifyEmbeds = [
  { type: "track", id: "5ceMxmqWcV50tgykuf1uNB" },
  { type: "album", id: "3z9zajCM0bfY54HaQItiuE" },
  { type: "album", id: "2HBCTi4YahVDat15quGqoP" },
  { type: "album", id: "3Tv7UZ8S4cs31mOpoW7332" },
  { type: "album", id: "2m7kFogtR5k2LG1MKjucvi" },
  { type: "album", id: "7bhDJk3pIEiAFw3GY5bKZI" },
];

const youtubeEmbeds = [
  { id: "70pNiXMOSzU", title: "Lyon Graulty video 1" },
  { id: "DfvMPFQHzPU", title: "Lyon Graulty video 2" },
  { id: "MA8rRv_qUFY", title: "Lyon Graulty video 3", params: "si=Tq_B4rPJVJniXVoz" },
];

const bandcampAlbums = [
  {
    title: "Thrift Set Orchestra",
    src: "https://bandcamp.com/EmbeddedPlayer/album=2136494614/size=large/bgcol=f6f1e7/linkcol=e8380a/tracklist=true/artwork=small/transparent=true/",
    href: "https://thriftset.bandcamp.com/album/thrift-set-orchestra",
  },
  {
    title: "The Oxblood Melodians",
    src: "https://bandcamp.com/EmbeddedPlayer/album=169816905/size=large/bgcol=f6f1e7/linkcol=e8380a/tracklist=true/artwork=small/transparent=true/",
    href: "https://jonathandoyle.bandcamp.com/album/the-oxblood-melodians",
  },
];

const bioParagraphs = [
  "Lyon Graulty is a multi-instrumentalist, composer and arranger from Austin, TX. The saxophone and clarinet are his main instruments, but the guitar is an ever-present force in his creative expression. More recently, drum machines and synthesizers have started to make inroads as well. He has shared the stage with Willie Nelson, Lyle Lovett, Ray Benson and Asleep at the Wheel, Steve Earle, Jimmie Vaughan, Bill Kirchen, Kelly Willis and Robert Earl Keen.",
  "Lyon grew up in the hills of Western Massachusetts, and started playing clarinet at age 10. He attended Jazz in July summer programs at University of Massachusetts Amherst where he was lucky enough to study closely with composer, pianist and educator, Billy Taylor and attend master classes from such luminaries as Yusef Lateef and Jason Moran. Later, he attended the University of Massachusetts Amherst and graduated in 2006 with a custom degree centered around Ethnomusicology, where he blended cultural studies and music performance.",
  "After graduation, Lyon joined Alt Country/Americana outfit The Amity Front touring and recording extensively. During those years, he joined up with honky tonker, JP Harris' band the Tough Choices playing tours all over the US. As a part of Woody Pines, Lyon twice toured in the UK. As a founding member of The Leisure Class, Lyon shared the stage with frontwoman Lauren Ambrose for some truly amazing shows in the Berkshires and NYC.",
  "In 2010, Lyon made the move to Austin TX and began prioritizing the saxophone and clarinet - leaning into swing, hot jazz and western swing and immediately freelancing around the vibrant Austin music scene. Lyon's versatility and reputation as a quick study on the bandstand led him to become an in demand horn player. Since arriving in Austin, he has played with the Eastside Dandies, the White Ghost Shivers, Thrift Set Orchestra, the Oxblood Melodions, the Jim Cullum Jazz Band, the Craig Gildner Big Band, the Dirty River Jazz Band, Brooks Prumo Orchestra, the Golden Hour Orchestra, the Relevators, Noelle Goforth, The Vintage Ties Jazz Band, Rent Party, and the Hollywood Revue. He occasionally tours and records with ten-time Grammy Award winning band Asleep at the Wheel.",
];

export function MusicPage() {
  const [emailCopied, setEmailCopied] = useState(false);
  const [shows, setShows] = useState<CalendarEvent[]>([]);
  const [showsStatus, setShowsStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadShows() {
      try {
        setShowsStatus("loading");
        const response = await fetch("/api/shows");
        const data = (await response.json()) as { events?: CalendarEvent[] };

        if (!response.ok || !data.events) {
          throw new Error("Shows could not be loaded.");
        }

        if (active) {
          setShows(data.events);
          setShowsStatus("ready");
        }
      } catch {
        if (active) {
          setShowsStatus("error");
        }
      }
    }

    loadShows();
    return () => {
      active = false;
    };
  }, []);

  async function copyEmail(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText("lyongraulty@gmail.com");
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1800);
  }

  return (
    <div className={styles.page}>
      <div className={styles.systemBar}>
        <p>Lyon Graulty - Music</p>
        <p>Austin, TX</p>
      </div>

      <div className={styles.hero}>
        <Image
          className={styles.heroPhoto}
          src="/20240218_Lyon%20Graulty_HR-7129_BW_3840px.webp"
          alt="Lyon Graulty black and white portrait"
          fill
          priority
          sizes="100vw"
        />
      </div>

      <section className={styles.intro}>
        <div className={styles.introLeft}>
          <div className={styles.introHead}>
            <h1 className={styles.introTitle}>
              Lyon Graulty
            </h1>
            <p className={styles.introPre}>Saxophone | Clarinet | Guitar | Arranging</p>
          </div>

          <div className={styles.introShows}>
            <div className={styles.moduleHeader}>
              <p className={styles.introShowsLabel}>Upcoming Shows</p>
              <span>{showsStatus === "ready" ? shows.length : showsStatus}</span>
            </div>
            <div className={styles.showsPanel} aria-live="polite">
              {showsStatus === "loading" && (
                <div className={styles.showsState}>
                  <span className={styles.showsPulse} />
                  <p>Loading shows</p>
                </div>
              )}

              {showsStatus === "error" && (
                <div className={styles.showsState}>
                  <p>Shows are temporarily unavailable. Refresh to try again.</p>
                </div>
              )}

              {showsStatus === "ready" && shows.length === 0 && (
                <div className={styles.showsState}>
                  <p>No upcoming shows are listed right now.</p>
                </div>
              )}

              {showsStatus === "ready" && shows.length > 0 && (
                <ol className={styles.showsList}>
                  {shows.map((show) => (
                    <li className={styles.showItem} key={show.id}>
                      <time className={styles.showDate} dateTime={show.start}>
                        <span>{show.dateLabel}</span>
                        <span>{show.timeLabel}</span>
                      </time>
                      <div className={styles.showInfo}>
                        <p>{show.title}</p>
                        {show.location && <span>{show.location}</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className={styles.introModule}>
            <div className={styles.moduleHeader}>
              <p className={styles.introShowsLabel}>Spotify</p>
              <span>{spotifyEmbeds.length}</span>
            </div>
            <div className={styles.spotifyGrid}>
              {spotifyEmbeds.map((item) => (
                <iframe
                  key={`${item.type}-${item.id}`}
                  src={`https://open.spotify.com/embed/${item.type}/${item.id}?utm_source=generator&theme=0`}
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`Spotify ${item.type} ${item.id}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.introModule}>
            <div className={styles.moduleHeader}>
              <p className={styles.introShowsLabel}>Video</p>
              <span>{youtubeEmbeds.length}</span>
            </div>
            <div className={styles.videoGrid}>
              {youtubeEmbeds.map((video) => {
                const query = video.params ? `?${video.params}` : "";

                return (
                  <div className={styles.videoWrapper} key={video.id}>
                    <iframe
                      className={styles.youtubeVideo}
                      src={`https://www.youtube.com/embed/${video.id}${query}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.introModule}>
            <div className={styles.moduleHeader}>
              <p className={styles.introShowsLabel}>Bandcamp</p>
              <span>{bandcampAlbums.length}</span>
            </div>
            <div className={styles.bandcampStack}>
              {bandcampAlbums.map((album) => (
                <div className={styles.bandcampItem} key={album.src}>
                  <iframe src={album.src} height="240" title={album.title}>
                    <a href={album.href}>{album.title}</a>
                  </iframe>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.introModule}>
            <div className={styles.moduleHeader}>
              <p className={styles.introShowsLabel}>SoundCloud</p>
            </div>
            <div className={styles.soundcloudWrap}>
              <iframe
                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lyongraulty&color=%23e8380a&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"
                height="520"
                allow="autoplay"
                title="SoundCloud - Lyon Graulty"
              />
            </div>
          </div>
        </div>

        <div className={styles.introBio}>
          <p className={styles.bioLabel}>Bio</p>
          {bioParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Available for performances, recording sessions, arranging, and select touring.</p>
        <div className={styles.footerActions}>
          <a href="https://www.instagram.com/lyongraultymusic/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="mailto:lyongraulty@gmail.com" onClick={copyEmail}>
            {emailCopied ? "Copied" : "Email"}
          </a>
          <a href="https://lyongraulty.com/" target="_blank" rel="noreferrer">
            Motion Design
          </a>
        </div>
        <div className={styles.footerMeta}>
          <span>Copyright 2026 Lyon Graulty Creative</span>
          <span>Austin, TX</span>
        </div>
      </footer>
    </div>
  );
}
