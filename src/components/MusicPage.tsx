"use client";

import { useEffect, useRef } from "react";
import styles from "./MusicPage.module.css";

export function MusicPage() {
  const calendarOuterRef = useRef<HTMLDivElement>(null);
  const calendarInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function scaleCalendar() {
      const outer = calendarOuterRef.current;
      const inner = calendarInnerRef.current;
      if (!outer || !inner) return;
      const scale = Math.min(1, outer.offsetWidth / 800);
      inner.style.transform = `scale(${scale})`;
      inner.style.height = `${380 * scale}px`;
    }

    scaleCalendar();
    window.addEventListener("resize", scaleCalendar);
    return () => window.removeEventListener("resize", scaleCalendar);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.systemBar}>
        <p>Lyon Graulty - Music</p>
        <p>Austin, TX</p>
      </div>

      <div className={styles.hero}>
        <img
          className={styles.heroPhoto}
          src="https://portfolio-media.b-cdn.net/SYNC/media_live/site/lyongraulty_musicprofile.webp"
          alt="Lyon Graulty"
          loading="eager"
        />
      </div>

      <section className={styles.intro}>
        <div className={styles.introLeft}>
          <div className={styles.introHead}>
            <p className={styles.introPre}>Multi-instrumentalist - Composer - Arranger</p>
            <h1 className={styles.introTitle}>
              Sax<span className={styles.introAccent}>.</span>
              <br />
              Clarinet<span className={styles.introAccent}>.</span>
              <br />
              Austin<span className={styles.introAccent}>.</span>
            </h1>
          </div>

          <div className={styles.introShows}>
            <p className={styles.introShowsLabel}>Upcoming Shows</p>
            <div className={styles.calendarOuter} ref={calendarOuterRef}>
              <div className={styles.calendarInner} ref={calendarInnerRef}>
                <iframe
                  src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FChicago&showPrint=0&showTitle=0&showNav=0&showDate=0&mode=AGENDA&showTabs=0&showTz=0&showCalendars=0&src=N2IzZTA5ZmYzYmM5ZmVkODU0NmVlYWUwMzEwYzNhZDhhYzBlMzUzMTY1ZGE0MmIxMjEwZjdhNmFiYjgwZjIwMEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23e8380a"
                  title="Upcoming shows"
                />
              </div>
            </div>
          </div>

          <div className={styles.introModule}>
            <p className={styles.introShowsLabel}>Spotify</p>
            <div className={styles.spotifyGrid}>
              {[
                "3z9zajCM0bfY54HaQItiuE",
                "2HBCTi4YahVDat15quGqoP",
                "3Tv7UZ8S4cs31mOpoW7332",
                "2m7kFogtR5k2LG1MKjucvi",
                "7bhDJk3pIEiAFw3GY5bKZI",
              ].map((id) => (
                <iframe
                  key={id}
                  src={`https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`}
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`Spotify album ${id}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.introModule}>
            <p className={styles.introShowsLabel}>Bandcamp</p>
            <div className={styles.bandcampStack}>
              <div className={styles.bandcampItem}>
                <iframe
                  src="https://bandcamp.com/EmbeddedPlayer/album=2136494614/size=large/bgcol=f6f1e7/linkcol=e8380a/tracklist=false/artwork=small/transparent=true/"
                  height="120"
                  title="Thrift Set Orchestra"
                >
                  <a href="https://thriftset.bandcamp.com/album/thrift-set-orchestra">Thrift Set Orchestra</a>
                </iframe>
              </div>
              <div className={styles.bandcampItem}>
                <iframe
                  src="https://bandcamp.com/EmbeddedPlayer/album=169816905/size=large/bgcol=f6f1e7/linkcol=e8380a/tracklist=false/artwork=small/transparent=true/"
                  height="120"
                  title="The Oxblood Melodians"
                >
                  <a href="https://jonathandoyle.bandcamp.com/album/the-oxblood-melodians">The Oxblood Melodians</a>
                </iframe>
              </div>
            </div>
          </div>

          <div className={styles.introModule}>
            <p className={styles.introShowsLabel}>SoundCloud</p>
            <div className={styles.soundcloudWrap}>
              <iframe
                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lyongraulty&color=%23e8380a&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
                height="300"
                allow="autoplay"
                title="SoundCloud - Lyon Graulty"
              />
            </div>
          </div>
        </div>

        <div className={styles.introBio}>
          <p>
            Lyon Graulty is a multi-instrumentalist, composer and arranger from Austin, TX. The saxophone and clarinet are his main instruments, but the guitar is an ever-present force in his creative expression. More recently, drum machines and synthesizers have started to make inroads as well. He has shared the stage with Willie Nelson, Lyle Lovett, Ray Benson and Asleep at the Wheel, Steve Earle, Jimmie Vaughan, Bill Kirchen, Kelly Willis and Robert Earl Keen.
          </p>
          <p>
            Lyon grew up in the hills of Western Massachusetts, and started playing clarinet at age 10. He attended Jazz in July summer programs at University of Massachusetts Amherst where he was lucky enough to study closely with composer, pianist and educator, Billy Taylor and attend master classes from such luminaries as Yusef Lateef and Jason Moran. Later, he attended the University of Massachusetts Amherst and graduated in 2006 with a custom degree centered around Ethnomusicology, where he blended cultural studies and music performance.
          </p>
          <p>
            After graduation, Lyon joined Alt Country/Americana outfit The Amity Front touring and recording extensively. During those years, he joined up with honky tonker, JP Harris&apos; band the Tough Choices playing tours all over the US. As a part of Woody Pines, Lyon twice toured in the UK. As a founding member of The Leisure Class, Lyon shared the stage with frontwoman Lauren Ambrose for some truly amazing shows in the Berkshires and NYC.
          </p>
          <p>
            In 2010, Lyon made the move to Austin TX and began prioritizing the saxophone and clarinet - leaning into swing, hot jazz and western swing and immediately freelancing around the vibrant Austin music scene. Lyon&apos;s versatility and reputation as a quick study on the bandstand led him to become an in demand horn player. Since arriving in Austin, he has played with the Eastside Dandies, the White Ghost Shivers, Thrift Set Orchestra, the Oxblood Melodions, the Jim Cullum Jazz Band, the Craig Gildner Big Band, the Dirty River Jazz Band, Brooks Prumo Orchestra, the Golden Hour Orchestra, the Relevators, Noelle Goforth, The Vintage Ties Jazz Band, Rent Party, and the Hollywood Revue. He occasionally tours and records with ten-time Grammy Award winning band Asleep at the Wheel.
          </p>
          <p>He is currently available for local gigs, recording sessions, arranging and select touring.</p>
        </div>
      </section>
    </div>
  );
}
