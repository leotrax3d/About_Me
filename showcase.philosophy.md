# Showcase — Philosophie

> Eine Designwebsite ohne jegliche Störung, ohne Designbrüche, ohne Text.
> Nur Geometrie und Form.

## Leitsatz

Diese Seite ist kein Portfolio-Abschnitt und keine Erklärung. Sie ist ein
Raum. Alles, was nicht reine Form ist — Überschriften, Beschriftungen,
Hinweise, Logos in Worten — wurde entfernt. Was bleibt, ist Geometrie:
Kreis, Quadrat, Dreieck, Linie und ein schwebender Drahtgitter-Körper.

Der Besucher liest nicht. Er sieht und bewegt sich.

## Prinzipien

1. **Kein Text.** Keine Wörter auf der Fläche. Navigation, Hinweise und
   Marke existieren ausschließlich als Form (Raute, Pfeil, pulsierende
   Linie). Wo Sprache nötig ist, lebt sie unsichtbar in `aria-label` für
   Screenreader — Zugänglichkeit ohne sichtbaren Bruch.

2. **Nur Schwarz und Weiß.** `#000000` und `#ffffff`. Keine Grautöne außer
   als Struktur (dünne Trennlinien bei sehr geringer Deckkraft). Keine
   Akzentfarbe, kein Verlauf, kein Schatten.

3. **Keine Störung, kein Bruch.** Ein durchgehendes Material über alle
   Sektionen: dieselbe Linienstärke, dieselbe Geste, derselbe Rhythmus.
   Jede Sektion ist eine Variation desselben Gedankens, nicht ein neues
   Thema.

4. **Bewegung ist die einzige Sprache.** Statt zu beschreiben, reagiert die
   Seite. Das Ikosaeder dreht sich von selbst und koppelt sich an die Maus,
   sobald sie eintritt. Die Linien enthüllen sich beim Scrollen. Form
   spricht durch Verhalten.

## Technische Haltung

Minimalismus im Bild verlangt Disziplin im Code:

- **Nur `transform` und `opacity`** werden animiert — nie `width`, `height`,
  `top` oder `left`. Das hält jede Bewegung auf dem Compositor und damit bei
  60 fps.
- **`will-change: transform`** auf jedem bewegten Element.
- **Kein Layout-Thrashing.** Positionen werden einmalig bei Initialisierung
  und bei `resize` gelesen (GSAP `invalidateOnRefresh`, gecachte
  `getBoundingClientRect`), niemals pro Frame.
- **`requestAnimationFrame`** für die Three.js-Szene; der Render-Loop pausiert
  per `IntersectionObserver`, wenn die Szene außerhalb des Bildschirms liegt.
- **Graceful degradation.** Fällt ein CDN aus, bleibt die Geometrie statisch
  bestehen. `prefers-reduced-motion` schaltet jede Animation ab, ohne die
  Komposition zu zerstören.

## Sektionen

Die Sektionen sind kein Stapel getrennter Blöcke, sondern eine durchgehende
Bewegung. Eine einzelne Fortschrittslinie (`.scroll-progress`) zeichnet sich
über die gesamte Reise und bindet alles zusammen. Jede Sektion geht logisch
in die nächste über:

| Sektion       | Form                               | Verhalten                                      |
| ------------- | ---------------------------------- | ---------------------------------------------- |
| Intro         | Ein einzelner Kreis (Portal)       | Beim Scrollen *in den Kreis hinein* (Zoom + Auflösung) |
| Pin           | Kreis → Quadrat → Dreieck          | Horizontaler Scrub; die Formen rotieren dabei  |
| Smooth-Scroll | Abstrakte horizontale Balken       | Linien zeichnen sich aus der Mitte heraus      |
| WebGL         | Drahtgitter-Ikosaeder (nur Kanten) | Wächst aus einem Punkt heran; Eigenrotation + Maus-Kopplung |
| Field         | Punkteschwarm + ein Kern-Kreis     | Magnet-Mechanik: Punkte einsammeln und im Kern auflösen |
| Footer        | Ein einzelner Punkt                | Ruhe                                           |

### Eine Geschichte, von Kreis zu Punkt

Die Zielscheibe (konzentrische Ringe) war ein *Bild* — eine erkennbare Sache.
Das widerspricht der reinen, abstrakten Geometrie. Sie ist einem **einzelnen
Kreis** gewichen: einem Portal, durch das man zu Beginn hineinfällt und das am
Ende als Kern wiederkehrt. Anfang und Ende reimen sich — Kreis zu Punkt.

Die Sektionen gehen ineinander über: man fällt durch den Kreis, schrubbt durch
die rotierenden Formen, die Linien zeichnen sich, das Ikosaeder wächst aus einem
Punkt heran — und mündet im **Field**, dem interaktiven Höhepunkt.

### Aufregend und beruhigend zugleich — das Field

1. Ein Raster weißer Punkte atmet leise und weicht dem Cursor aus *(beruhigend)*.
2. In der Mitte sitzt ein kleiner **Kern-Kreis**. Der Cursor wird magnetisch in
   ihn hineingezogen; bei Berührung füllt sich der Cursor voll weiß und wird
   selbst zum **Magneten**.
3. Von da an ziehen sich alle Punkte zum Cursor und kleben an ihm — man muss
   sie *loswerden* *(aufregend)*.
4. Solange der Magnet aktiv ist, lässt sich nur mit **einer festen, langsamen
   Geschwindigkeit** weiterscrollen. Man steuert die anhängenden Punkte zurück
   in den Kern, wo sie verschluckt werden und verschwinden.
5. Ist der letzte Punkt fort, löst sich der Magnet, das Scrollen ist wieder
   frei — der ganze Lärm auf einen einzelnen Kreis reduziert.

Die einzige Eingabe ist der Zeiger des Nutzers — kein Knopf, kein Wort. Form,
die auf Berührung antwortet.

> Derselbe reaktive Punkteschwarm (Atmen + Ausweichen vor dem Cursor) liegt als
> lebendiger Hintergrund auch auf der Startseite (`index.html`) — er ersetzt dort
> das frühere statische Punktraster.

## Übertrag auf die Startseite

Die Startseite folgt einem verwandten, aber eigenen Gedanken: Sie soll keine
Seite sein, die man *herunterscrollt*, sondern eine, an die man sich
*erinnert*. Wo der Showcase reine Form ist, ist die Startseite ein **lebendes
Terminal** — alles Verhalten spricht die Sprache der Konsole, nicht die eines
Design-Tools.

### Prinzipien

1. **Reaktion statt Dekoration.** Kein Element bewegt sich grundlos. Das
   Punktefeld weicht dem Cursor aus; ein Klick — irgendwo, jederzeit — schickt
   eine **Schockwelle** durch das Feld, die die Punkte in Akzentfarbe
   aufleuchten lässt. Die Seite antwortet auf Berührung, sie performt nicht
   vor sich hin.

2. **Ein Verhalten, eine Sprache.** Die Headline besteht aus einzelnen
   Buchstaben, die dem Cursor ausweichen — *dasselbe* Verhalten wie die
   Punkte des Feldes dahinter. Kein zweites Bewegungsvokabular, keine
   fremde Metapher: Vordergrund und Hintergrund gehorchen demselben Gesetz.

3. **Text verhält sich wie ein Terminal.** Überschriften *dekodieren* sich
   beim ersten Sichtkontakt aus Zeichenrauschen (Scramble-Effekt);
   Projektnamen tun es erneut bei jedem Hover; Navigationslinks flackern beim
   Überfahren.

4. **Scrollen ist Choreografie, nicht Förderband.** Eine Scroll-Geste, drei
   Antworten: Die Hero *zoomt heraus* und gibt die Bühne frei, das Lauf-Band
   zieht quer als horizontaler Puls, und die Skills-Sektion *pinnt sich
   fest* — weiteres Scrollen fährt sie seitwärts durch, bevor die Reise
   abwärts weitergeht. Die Richtung wechselt, das Eingabegerät nie.

5. **Entdeckbar, nie blockierend.** Jede Interaktion ist optional und im Weg
   von niemandem: Die Schockwelle stört keinen Klick, der Scramble keinen
   Lesefluss, das Terminal-Easteregg (Dreifachklick) keinen Besucher, der es
   nie findet. Wer spielt, wird belohnt; wer liest, wird nicht aufgehalten.

6. **Bewusst, nicht voll.** Keine Uhren, keine Scroll-Indikatoren, keine
   Icon-Garnitur auf Buttons. Was da ist, verhält sich: Punktefeld,
   Schockwelle, ausweichende Buchstaben, Scramble, Lauf-Band, Terminal.
   Der Erinnerungswert kommt aus dem Verhalten, nicht aus der Menge.

7. **`prefers-reduced-motion` gilt absolut.** Scramble, Schockwelle,
   Buchstaben-Ausweichen, Hero-Zoom, Lauf-Band und Skills-Travel schalten
   sich ab; die Skills fallen auf einen nativ scrollbaren Streifen zurück,
   die Komposition bleibt vollständig lesbar stehen.

## Was diese Seite nicht ist

- Kein Erklärtext, keine Feature-Liste, kein Call-to-Action.
- Keine Bilder, keine Fotos, keine Icons mit Bedeutung.
- Kein „mehr ist mehr". Jedes hinzugefügte Element muss reine Form sein —
  sonst gehört es nicht hierher.

> Im Zweifel: weglassen.
