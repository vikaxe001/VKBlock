# VKBlock

En tjänst för att begränsa åtkomsten till valda webbplatser i webbläsare utifrån en fördefinierad blocklista.

VKBlock gör det möjligt att centralt administrera vilka webbplatser eller delar av webbplatser som ska blockeras. Blockeringslistan uppdateras automatiskt utan att tillägget behöver installeras om.

**Aktuell version:** 1.0.5  
**Webbläsarstöd:** Chrome (stöd för Safari planeras)  
**Konfiguration:** Central `blocklist.txt`  
**Källkod:** [GitHub](https://github.com/vikaxe001/VKBlock)

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
- Central distribution och hantering i organisationens webbläsarmiljö.

Tjänsten består av ett webbläsartillägg och en centralt publicerad blockeringslista. Blockeringen genomförs lokalt i användarens webbläsare.

## 1.2 Blockeringsregler

Blockeringslistan hanteras genom textfilen `blocklist.txt`, där varje rad motsvarar en blockeringsregel.

Exempel:

    sites.google.com/view/classroom6x/
    1001games.com
    aarp.org
    youtube.com/shorts/

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

Tomma rader ignoreras och rader som börjar med `#` kan användas som kommentarer.

## 1.3 Uppdatering och lokal lagring

VKBlock kontrollerar den centrala blockeringslistan var 15:e minut.

För att minimera nätverkstrafik och resursanvändning används:

- **HTTP-cachevalidering:** Webbläsaren kan återanvända tidigare hämtad information om blockeringslistan inte förändrats.
- **SHA-256:** En kontrollsumma används för att avgöra om blockeringslistans innehåll har förändrats.
- **Villkorad regeluppdatering:** Blockeringsreglerna byggs endast om när innehållet förändrats eller när installerade regler behöver återskapas.

Reglerna lagras lokalt och fortsätter att fungera även om en uppdatering tillfälligt misslyckas.

Ändringar i blockeringslistan kräver ingen ny version av tillägget. Ändringar i programkoden kräver däremot en ny version.

## 1.4 Informationssäkerhet och integritet

VKBlock genomför blockeringen lokalt och skickar inte användarnas webbhistorik eller uppgifter om blockerade sidbesök till någon central tjänst.

Blockeringslistan innehåller endast regler för vilka webbadresser som ska blockeras.

Källkoden är öppet tillgänglig för granskning. Behörigheten att ändra programkoden och den centrala blockeringslistan bör begränsas till behöriga personer.

## 1.5 Begränsningar

VKBlock fungerar endast i webbläsare där tillägget stöds, är installerat och aktiverat.

Blockeringen baseras på webbadresser och inte på analys av webbplatsers innehåll. Innehåll kan därför i vissa fall nås via alternativa domäner eller tjänster.

På webbplatser med dynamisk navigering kan en kort fördröjning förekomma innan blockeringen genomförs.

VKBlock är ett kompletterande verktyg för webbadressblockering och ska inte betraktas som ett fullständigt webbfilter.

---

# 2. Utveckling av tjänsten

## 2.1 Teknik och arkitektur

VKBlock är utvecklat med JavaScript, HTML och CSS.

Den nuvarande Chrome-versionen använder Manifest V3 och följande API:er:

- `declarativeNetRequest` – blockering av webbadresser.
- `storage` – lokal lagring av konfiguration och blockeringsregler.
- `alarms` – schemalagd uppdatering av blockeringslistan.

GitHub används för versionshantering och GitHub Pages för publicering av blockeringslistan och installationsfiler.

## 2.2 Projektets filer

| Fil | Funktion |
|---|---|
| `manifest.json` | Konfiguration, behörigheter, version och ikoner. |
| `background.js` | Hämtning och uppdatering av blockeringsregler. |
| `content.js` | Kontroll av dynamiska adressändringar. |
| `blocked.html` | Blockeringssidans innehåll och utseende. |
| `blocked.js` | Hantering av blockeringssidan. |
| `blocklist.txt` | Centralt administrerad blockeringslista. |
| `updates.xml` | Information om nya tilläggsversioner. |
| `VKBlock-main.crx` | Signerat installationspaket för Chrome. |
| `icons/` | Tilläggets ikoner i PNG-format (16, 48 och 128 px). |

## 2.3 Hantering av blockeringslistan

Blockeringslistan publiceras på:

https://vikaxe001.github.io/VKBlock/blocklist.txt

För att ändra blockerade webbadresser:

1. Öppna `blocklist.txt` i GitHub.
2. Lägg till, ändra eller ta bort regler.
3. Spara ändringarna genom att skapa en commit.
4. Kontrollera att filen har publicerats via GitHub Pages.

Tillägget hämtar därefter den uppdaterade listan automatiskt.

Varje rad ska innehålla en giltig domän eller domän med sökväg. Den nuvarande implementationen stöder upp till 1 000 regler.

## 2.4 Utveckling och testning

Chrome-versionen kan testas lokalt:

1. Ladda ned projektets källkod.
2. Öppna `chrome://extensions`.
3. Aktivera **Utvecklarläge**.
4. Välj **Läs in opaketerat tillägg**.
5. Välj mappen som innehåller `manifest.json`.

Verifiera att domäner och sökvägar blockeras korrekt, att blockeringssidan fungerar och att tidigare regler kvarstår vid tillfälliga uppdateringsproblem.

Kontrollera även att ikonerna visas korrekt i tilläggshanteringen.

## 2.5 Paketering och publicering

Ändringar i programkoden eller tilläggets resurser kräver en ny version.

För Chrome:

1. Uppdatera versionsnumret i `manifest.json`.
2. Testa ändringarna.
3. Paketera tillägget som en CRX-fil.
4. Använd samma privata signeringsnyckel som tidigare.
5. Publicera det nya CRX-paketet.
6. Uppdatera versionsnumret i `updates.xml`.

**Viktigt:** Den privata signeringsnyckeln (`.pem`) får inte publiceras i GitHub.

Nuvarande distributionsfiler:

- [CRX-paket](https://vikaxe001.github.io/VKBlock/VKBlock-main.crx)
- [Uppdateringsinformation](https://vikaxe001.github.io/VKBlock/updates.xml)

## 2.6 Central distribution

VKBlock är utformat för att kunna distribueras och hanteras centralt i organisationens enhets- och webbläsarmiljö.

**Nuvarande stöd – Chrome**

Chrome-versionen kan distribueras genom Google Admin till hanterade användare och enheter.

**Tilläggs-ID:** `ohnheegnfgjmplapdldhilognpjcnnal`

**Uppdateringsadress:**  
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
