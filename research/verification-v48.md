# v4.8 street football formations

Both teams now use persistent defender, midfielder and forward slots. Balanced, Defensive and Attacking formation options depend on the selected outfield count; one and two players use a fixed shape. Seven outfield players offer 2–3–2, 3–3–1 and 2–2–3. Goalkeepers remain additional to that count.

Each team assigns one player to press an opponent or collect a loose ball. A short assignment hold and distance margin avoid rapid switching. A nominated pass receiver takes priority. Other players retain lane/line anchors with limited ball-side movement, defensive cover and passing support. Controlled players remain under human control; a nearby human presser prevents an additional teammate joining the chase. Shape resets after goals. Tactical plans update at most every 160 ms unless possession or the controlled player changes; player movement remains continuous.

Validation: automated tests cover each team size/style, unique starting slots, maintained attacking width/depth, one collector, pressing stability, receiver priority, mirrored bounded targets, goalkeeper regressions and post-goal formation reset. Full gameplay suite and syntax/import/HTML checks pass. Browser control remains unavailable, so no new visual or physical-device playtest is claimed.
