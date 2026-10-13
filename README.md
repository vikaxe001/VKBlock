# VKBlock

En tjänst för att begränsa åtkomsten till valda webbplatser i webbläsare utifrån en fördefinierad blocklista.

VKBlock gör det möjligt att centralt administrera vilka webbplatser eller delar av webbplatser som ska blockeras. Blockeringslistan uppdateras automatiskt utan att tillägget behöver installeras om.

**Aktuell version:** 1.0.4  
**Webbläsarstöd:** Chrome (stöd för Safari planeras)  
**Konfiguration:** Central `blocklist.txt`  
**Källkod:** [GitHub](https://github.com/vikaxe001/VKBlock)

---

## Innehållsförteckning

### 1. Beskrivning av tjänsten
- [1.1 Syfte och funktion](#11-syfte-och-funktion)
- [1.2 Blockeringsregler](#12-blockeringsregler)
- [1.3 Uppdatering och lokal lagring](#13-uppdatering-och-lokal-lagring)
- [1.4 Informationssäkerhet och integritet](#14-informationssäkerhet-och-integritet)
- [1.5 Begränsningar](#15-begränsningar)

### 2. Utveckling av tjänsten
- [2.1 Teknik och arkitektur](#21-teknik-och-arkitektur)
- [2.2 Projektets filer](#22-projektets-filer)
- [2.3 Hantering av blockeringslistan](#23-hantering-av-blockeringslistan)
- [2.4 Utveckling och testning](#24-utveckling-och-testning)
- [2.5 Paketering och publicering](#25-paketering-och-publicering)
- [2.6 Central distribution](#26-central-distribution)
- [2.7 Framtida utveckling](#27-framtida-utveckling)

---

# 1. Beskrivning av tjänsten

## 1.1 Syfte och funktion

VKBlock är utvecklat för att begränsa åtkomsten till valda webbplatser och webbinnehåll. Tjänsten kan exempelvis användas inom utbildningsverksamhet för att minska tillgången till distraherande innehåll och bidra till ökad studiero.

VKBlock erbjuder:

- Central administration av blockerade webbadresser.
- Blockering av hela domäner eller specifika sökvägar.
- Automatisk uppdatering av blockeringslistan.
- Lokal lagring av blockeringsregler.
- Fortsatt blockering vid tillfälliga uppdateringsproblem.
- Hantering av dynamisk navigering inom webbplatser.
- Anpassad blockeringssida med länk till en fördefinierad startsida.

Tjänsten består av ett webbläsartillägg och en centralt publicerad blockeringslista. Blockeringen genomförs lokalt i användarens webbläsare.

## 1.2 Blockeringsregler

Blockeringslistan hanteras genom en textfil, `blocklist.txt`, där varje rad motsvarar en blockeringsregel.

Exempel:

```text
sites.google.com/view/classroom6x/
1001games.com
aarp.org
youtube.com/shorts/
```

**Domänblockering**

En regel utan sökväg blockerar hela domänen inklusive underdomäner.

Exempel: `1001games.com` blockerar även `www.1001games.com` och dess undersidor.

**Sökvägsblockering**

En regel med sökväg blockerar endast den angivna sökvägen och dess undersidor.

Exempel: `sites.google.com/view/classroom6x/` blockerar:

- `sites.google.com/view/classroom6x/`
- `sites.google.com/view/classroom6x/spel`

Men tillåter:

- `sites.google.com/view/legitimsida`
- `sites.google.com/view/classroom6x2/`

Tomma rader ignoreras och rader som börjar med `#` kan användas som kommentarer.

## 1.3 Uppdatering och lokal lagring

VKBlock hämtar blockeringslistan från en central adress med ett fördefinierat intervall, normalt var femte minut.

Reglerna lagras lokalt på användarens enhet och fortsätter att fungera även om en uppdatering tillfälligt misslyckas.

Ändringar i blockeringslistan kräver därför ingen ny version av tillägget.

Ändringar i programkoden kräver däremot att en ny version publiceras och distribueras.

## 1.4 Informationssäkerhet och integritet

VKBlock genomför blockeringen lokalt och skickar inte användarnas webbhistorik eller uppgifter om blockerade sidbesök till någon central tjänst.

Den centrala blockeringslistan innehåller endast regler för vilka webbadresser som ska blockeras.

Källkoden är öppet tillgänglig för granskning och vidareutveckling. Åtkomst till publicering och ändring av blockeringslistan bör begränsas till behöriga personer.

## 1.5 Begränsningar

VKBlock fungerar endast i webbläsare där tillägget stöds, är installerat och aktiverat.

Blockeringen baseras på webbadresser och inte på analys av webbplatsers innehåll. Det innebär att samma innehåll i vissa fall kan nås genom alternativa domäner eller tjänster.

På webbplatser med dynamisk navigering kan en kort fördröjning förekomma innan blockeringen genomförs.

VKBlock är ett kompletterande verktyg för webbadressblockering och ska inte betraktas som ett fullständigt webbfilter.

---

# 2. Utveckling av tjänsten

## 2.1 Teknik och arkitektur

VKBlock är utvecklat med JavaScript, HTML och CSS.

Den nuvarande implementationen använder Chrome Extensions Manifest V3 och följande API:er:

- `declarativeNetRequest` – blockering av webbadresser.
- `storage` – lokal lagring av konfiguration och blockeringsregler.
- `alarms` – schemalagd uppdatering av blockeringslistan.

GitHub används för versionshantering och GitHub Pages för publicering av blockeringslistan och installationsfiler.

## 2.2 Projektets filer

| Fil | Funktion |
|---|---|
| `manifest.json` | Konfiguration, behörigheter och version. |
| `background.js` | Hämtning och uppdatering av blockeringsregler. |
| `content.js` | Kontroll av dynamiska adressändringar. |
| `blocked.html` | Blockeringssidans innehåll och utseende. |
| `blocked.js` | Hantering av blockeringssidan. |
| `blocklist.txt` | Centralt administrerad blockeringslista. |
| `updates.xml` | Information om nya tilläggsversioner. |
| `VKBlock-main.crx` | Signerat installationspaket för Chrome. |

## 2.3 Hantering av blockeringslistan

Blockeringslistan publiceras på:

https://vikaxe001.github.io/VKBlock/blocklist.txt

För att ändra blockerade webbadresser:

1. Öppna `blocklist.txt` i GitHub.
2. Lägg till, ändra eller ta bort regler.
3. Spara genom att skapa en commit.
4. Kontrollera att ändringen publicerats via GitHub Pages.

Tillägget hämtar därefter den uppdaterade listan automatiskt.

Varje rad ska innehålla en giltig domän eller domän med sökväg. Den nuvarande implementationen stöder upp till 1 000 regler.

## 2.4 Utveckling och testning

Den aktuella Chrome-versionen kan testas lokalt genom att läsa in tillägget i utvecklarläge.

1. Ladda ned projektets källkod.
2. Öppna `chrome://extensions`.
3. Aktivera **Utvecklarläge**.
4. Välj **Läs in opaketerat tillägg**.
5. Välj mappen som innehåller `manifest.json`.

Verifiera särskilt att:

- Domäner och sökvägar blockeras korrekt.
- Andra sökvägar på samma domän förblir tillgängliga.
- Blockeringssidan fungerar.
- Dynamisk navigering hanteras.
- Befintliga regler kvarstår vid uppdateringsfel.

## 2.5 Paketering och publicering

Ändringar i programkoden kräver en ny version av tillägget.

För Chrome gäller följande:

1. Uppdatera versionsnumret i `manifest.json`.
2. Testa ändringarna.
3. Paketera tillägget som en CRX-fil.
4. Använd samma privata signeringsnyckel som tidigare.
5. Publicera den nya CRX-filen.
6. Uppdatera versionsnumret i `updates.xml`.

**Viktigt:** Den privata signeringsnyckeln (`.pem`) får inte publiceras i GitHub.

Nuvarande distributionsfiler:

- [CRX-paket](https://vikaxe001.github.io/VKBlock/VKBlock-main.crx)
- [Uppdateringsinformation](https://vikaxe001.github.io/VKBlock/updates.xml)

## 2.6 Central distribution

VKBlock är utformat för att kunna distribueras och hanteras centralt i organisationens enhets- och webbläsarmiljö.

**Nuvarande stöd – Chrome**

Chrome-versionen kan distribueras genom Google Admin till hanterade användare och enheter.

Tilläggs-ID:

`ohnheegnfgjmplapdldhilognpjcnnal`

Uppdateringsadress:

`https://vikaxe001.github.io/VKBlock/updates.xml`

I Google Admin kan tillägget konfigureras för tvingande installation och central hantering.

Användning i inkognitoläge styrs genom tillämpliga webbläsarpolicyer.

## 2.7 Framtida utveckling

Den fortsatta utvecklingen fokuserar på att göra VKBlock tillgängligt för fler webbläsare och plattformar.

Planerade utvecklingsområden:

- Stöd för Safari på iPadOS.
- Gemensam blockeringslista för flera webbläsare.
- Förbättrad testning och validering av blockeringsregler.
- Vidareutveckling av central distribution och hantering.

Målet är att VKBlock ska kunna användas i olika webbläsarmiljöer med samma grundläggande funktionalitet och en gemensamt administrerad blockeringslista.

---

**VKBlock – central hantering av webbadressblockering.**
