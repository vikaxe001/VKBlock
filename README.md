# VKBlock

**VKBlock** är ett kostnadsfritt Chrome-tillägg för central blockering av webbadresser i hanterade Google Chrome-miljöer. Tillägget är utvecklat med fokus på Google Workspace for Education och kan distribueras centralt till användare via Google Admin.

Syftet är att möjliggöra flexibel och central hantering av blockerade webbadresser utan att behöva uppdatera eller installera om tillägget varje gång blockeringslistan förändras.

VKBlock använder en offentligt tillgänglig blockeringslista på GitHub Pages och uppdaterar denna automatiskt med ett konfigurerbart intervall.

## Funktioner

- **Central blockeringslista:** Webbadresser som ska blockeras administreras i en JSON-fil på GitHub Pages.
- **Specifika URL-sökvägar:** Blockerar delar av webbplatser utan att nödvändigtvis blockera hela domänen.
- **Automatisk uppdatering:** Hämtar blockeringslistan var femte minut som standard.
- **Stöd för intern navigering:** Kan upptäcka adressändringar på webbplatser som använder dynamisk navigering, exempelvis YouTube.
- **Anpassad blockeringssida:** Visar vilken webbadress som blockerats.
- **Konfigurerbar startsida:** Användaren kan återvända till en centralt angiven startsida.
- **Central distribution:** Kan tvångsinstalleras via Google Admin.
- **Inkognitoläge:** Kan konfigureras som obligatoriskt tillägg för inkognitosurfning på hanterade Chrome-enheter som stöder policyn.
- **Lokal regelhantering:** Senast installerade blockeringsregler fortsätter fungera om blockeringslistan tillfälligt inte kan hämtas.

VKBlock använder Chrome Extensions Manifest V3 och Chromes inbyggda API:er.

## Hur fungerar VKBlock?

VKBlock består av två huvuddelar: ett Chrome-tillägg som installeras i webbläsaren och en central konfigurationsfil som publiceras via GitHub Pages.

När tillägget startas hämtas blockeringslistan från GitHub. Listan översätts till blockeringsregler som installeras lokalt i Chrome med hjälp av `declarativeNetRequest`.

Chrome kan därefter blockera matchande webbadresser utan att behöva kontakta GitHub vid varje sidbesök.

Tillägget kontrollerar regelbundet om blockeringslistan har förändrats. Om en ny lista finns uppdateras de lokala reglerna automatiskt.

För webbplatser som använder intern navigering finns dessutom ett innehållsskript som kontrollerar webbadressändringar utan att en fullständig sidomladdning behöver ske.

### Exempel

Om blockeringslistan innehåller:

`youtube.com/shorts`

ska följande adresser blockeras:

- `https://youtube.com/shorts`
- `https://www.youtube.com/shorts/abc123`
- `https://m.youtube.com/shorts/abc123`

Samtidigt förblir exempelvis följande adresser tillgängliga:

- `https://www.youtube.com/`
- `https://www.youtube.com/watch?v=abc123`

Blockeringen baseras på matchande domän och sökväg. Det krävs ingen separat lista över tillåtna webbadresser.

Den aktuella versionen stöder domänen och dess vanliga `www.`- och `m.`-varianter. Godtyckliga underdomäner och jokertecken stöds inte i blockeringslistan.

## Projektets filer

| Fil | Beskrivning |
|---|---|
| `manifest.json` | Tilläggets grundkonfiguration, behörigheter och versionsnummer. |
| `background.js` | Hämtar blockeringslistan och uppdaterar Chromes blockeringsregler. |
| `content.js` | Kontrollerar interna adressändringar på webbplatser. |
| `blocked.html` | HTML och utseende för blockeringssidan. |
| `blocked.js` | Visar blockerad adress och hanterar länken till startsidan. |
| `blocklist.json` | Central konfiguration av blockerade webbadresser och startsida. |
| `updates.xml` | Anger tillgänglig version och nedladdningsadress för tillägget. |
| `VKBlock-main.crx` | Signerat installationspaket för Chrome. |

Den privata signeringsnyckeln (`.pem`) ska aldrig publiceras i detta repository.

## Konfiguration av blockeringslistan

Blockeringslistan hanteras genom filen `blocklist.json`.

Exempel:

```json
{
  "version": 2,
  "homepage": "https://www.google.com/",
  "blocked": [
    {
      "domain": "youtube.com",
      "path": "/shorts"
    },
    {
      "domain": "reddit.com",
      "path": "/r/gaming"
    },
    {
      "domain": "example.com",
      "path": "/games"
    }
  ]
}
```

### Förklaring av inställningar

**version**

Versionsmarkering för blockeringslistans format. Den styr inte Chrome-tilläggets versionsnummer eller uppdateringsmekanism.

**homepage**

Webbadress som användaren ska skickas till när denne väljer "Tillbaka till startsidan" på blockeringssidan.

Om inställningen saknas eller är ogiltig används:

`https://www.google.com/`

**blocked**

En lista över blockeringsregler.

Varje regel innehåller:

- `domain` – domänen som ska kontrolleras.
- `path` – sökvägen som ska blockeras.

En sökväg omfattar även underliggande sökvägar.

Exempelvis blockerar `/shorts` både `/shorts` och `/shorts/abc123`, men inte `/shortstories`.

### Uppdatera blockeringslistan

1. Öppna `blocklist.json` på GitHub.
2. Klicka på **Edit**.
3. Lägg till, ändra eller ta bort blockeringsregler.
4. Spara genom **Commit changes**.
5. Vänta tills GitHub Pages har publicerat den uppdaterade filen.

VKBlock kontrollerar automatiskt blockeringslistan var femte minut som standard.

**Ingen ny paketering, installation eller ändring i Google Admin behövs när endast blockeringslistan förändras.**

Uppdatering sker inte nödvändigtvis exakt efter fem minuter eftersom schemalagda bakgrundsprocesser påverkas av Chromes aktivitet och vilolägen.

### Blockeringslistans adress

`https://vikaxe001.github.io/VKBlock/blocklist.json`

## Blockeringssidan

När en användare försöker öppna en blockerad webbadress visas en lokal informationssida.

Exempel:

**Webbsidan är blockerad**

Webbplatsen **youtube.com/shorts/abc123** är inte tillgänglig för dig.

**← Tillbaka till startsidan**

Blockeringssidan visar domän och sökväg, men inte URL:ens frågeparametrar.

Startsidan bestäms genom `homepage` i blockeringslistan.

Blockeringssidan ingår i tilläggspaketet och fungerar därför utan att någon extern webbsida behöver laddas.

## Automatiska uppdateringar

VKBlock har två separata uppdateringsmekanismer.

### 1. Uppdatering av blockeringslistan

Blockeringslistan hämtas automatiskt från GitHub Pages var femte minut.

Ändringar av blockerade webbadresser eller startsidan kräver ingen ny version av tillägget.

Senast fungerande blockeringsregler finns kvar lokalt om hämtningen misslyckas.

### 2. Uppdatering av Chrome-tillägget

Ändringar av tilläggets programkod, behörigheter eller gränssnitt kräver en ny version av CRX-paketet.

Chrome kontrollerar normalt automatiskt om en ny version finns, vid uppstart och återkommande med några timmars mellanrum.

Uppdateringsmekanismen använder filen `updates.xml` som pekar på den senaste publicerade CRX-filen.

När en nyare version identifieras laddar Chrome ned och installerar den automatiskt.

Det krävs normalt ingen ny installation via Google Admin så länge tilläggets ID och uppdateringsadress är oförändrade.

## Central installation via Google Admin

VKBlock kan distribueras till hanterade ChromeOS-enheter och Chrome-profiler genom Google Workspace.

### Förutsättningar

- Tillgång till Google Admin med behörighet att hantera Chrome-tillägg.
- En organisationsenhet (OU) med de användare som ska omfattas.
- Ett signerat CRX-paket.
- En offentligt tillgänglig `updates.xml`.
- En fungerande HTTPS-adress till CRX-paketet.

### Installera tillägget

1. Öppna [Google Admin](https://admin.google.com).
2. Navigera till **Enheter → Chrome → Appar och tillägg → Användare och webbläsare**.
3. Välj organisationsenheten där VKBlock ska distribueras.
4. Klicka på **Lägg till Chrome-app eller tillägg via ID**.
5. Välj installation från en anpassad URL.
6. Ange tilläggets ID och uppdateringsadress.
7. Välj installationspolicy **Tvångsinstallera**.
8. Spara inställningarna.

**Tilläggs-ID för denna distribution:**

`ohnheegnfgjmplapdldhilognpjcnnal`

**Uppdateringsadress:**

`https://vikaxe001.github.io/VKBlock/updates.xml`

Administratören kan därefter kontrollera att installationen genomförts genom att öppna `chrome://extensions` på en hanterad Chromebook.

### Inkognitoläge

Chrome-tillägg är normalt inte aktiverade i inkognitoläge.

För VKBlock kan administratören aktivera inställningen:

**Tillägget är obligatoriskt för inkognitoläge (Extension is mandatory for Incognito)**

Inställningen finns bland tilläggets inställningar i Google Admin.

När policyn tillämpas måste användaren godkänna tillägget för inkognitoläge. Om användaren inte godkänner kan denne inte fortsätta navigera i inkognitoläget.

Godkännandet kan göras genom `chrome://extensions`.

Inställningen har testats i projektets hanterade Chromebook-miljö.

### Testmiljö

Den ursprungliga distributionen av VKBlock har genomförts i organisationsenheten:

`TestShorts`

Följande har verifierats för version 1.0.1:

- Installation via anpassad URL i Google Admin.
- Tvångsinstallation på hanterad Chromebook.
- Blockering av YouTube Shorts.
- Tillgång till vanliga YouTube-videor.
- Krav på godkännande av tillägget för inkognitoläge.

Version 1.0.2 innehåller ändringar av blockeringssidan, startsidelänken och uppdateringsintervallet. Dessa funktioner ska verifieras innan bredare distribution.

---

## Utveckling och paketering av nya versioner

Det här avsnittet beskriver hur en administratör publicerar en ny version av själva tillägget.

### Steg 1 – ändra koden

Gör nödvändiga ändringar i projektets filer på GitHub.

Exempel på ändringar som kräver ny version:

- Ny funktionalitet i `background.js`.
- Ändringar av intern navigering i `content.js`.
- Ny design eller funktion i blockeringssidan.
- Ändringar i `manifest.json`.

Ändringar enbart i `blocklist.json` kräver inte ny tilläggsversion.

### Steg 2 – höj versionsnumret

Öppna `manifest.json` och höj versionsnumret.

Exempel:

```json
"version": "1.0.3"
```

Versionsnumret måste vara högre än den version som redan är installerad.

Behåll samma `update_url`:

```json
"update_url": "https://vikaxe001.github.io/VKBlock/updates.xml"
```

### Steg 3 – förbered filerna lokalt

Ladda ned projektets uppdaterade källkod från GitHub.

Skapa en separat mapp för tilläggets installationsfiler, exempelvis:

```text
VKBlock-Package/
├── manifest.json
├── background.js
├── content.js
├── blocked.html
└── blocked.js
```

Ta inte med filer som `README.md`, `updates.xml`, `blocklist.json` eller tidigare CRX-paket i installationsmappen om de inte uttryckligen behövs i tillägget.

**Den privata `.pem`-nyckeln får inte ligga i den mapp som ska paketeras.**

### Steg 4 – paketera tillägget

Öppna Google Chrome på administratörens dator.

1. Navigera till `chrome://extensions`.
2. Aktivera **Utvecklarläge**.
3. Klicka på **Pack extension**.
4. Välj mappen `VKBlock-Package` som *Extension root directory*.
5. Under *Private key file*, välj den ursprungliga privata `.pem`-nyckeln.
6. Klicka på **Pack extension**.

Chrome skapar ett nytt signerat CRX-paket.

**Använd alltid samma privata `.pem`-nyckel.**

Tilläggets ID baseras på signeringsnyckeln. Om en annan nyckel används får tillägget ett annat ID och betraktas som ett annat tillägg av Chrome.

### Steg 5 – hantera den privata signeringsnyckeln

`.pem`-filen är den privata nyckel som används för att signera framtida versioner.

Den ska:

- Förvaras säkert och med begränsad åtkomst.
- Säkerhetskopieras på en godkänd och skyddad plats.
- Aldrig publiceras på GitHub.
- Aldrig inkluderas i CRX-paketet.
- Återanvändas vid varje ny paketering.

Om nyckeln förloras kan det bli nödvändigt att skapa en ny tilläggsidentitet och distribuera ett nytt tillägg via Google Admin.

### Steg 6 – publicera CRX-paketet

Byt namn på det nya CRX-paketet till:

`VKBlock-main.crx`

Ersätt sedan den befintliga filen med samma namn i GitHub-repositoryt.

CRX-paketet publiceras via GitHub Pages på:

`https://vikaxe001.github.io/VKBlock/VKBlock-main.crx`

GitHub Pages måste leverera filen med en Content-Type som Chrome accepterar, exempelvis:

`application/x-chrome-extension`

Detta har verifierats för den ursprungliga distributionen.

### Steg 7 – uppdatera updates.xml

Öppna filen `updates.xml` på GitHub.

Ändra attributet `version` så att det överensstämmer med versionsnumret i `manifest.json`.

Exempel för version 1.0.3:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response"
         protocol="2.0">
  <app appid="ohnheegnfgjmplapdldhilognpjcnnal">
    <updatecheck
      codebase="https://vikaxe001.github.io/VKBlock/VKBlock-main.crx"
      version="1.0.3" />
  </app>
</gupdate>
```

Spara genom **Commit changes**.

Kontrollera därefter att GitHub Pages publicerat både den nya CRX-filen och den uppdaterade XML-filen.

Det är viktigt att CRX-paketet finns tillgängligt innan `updates.xml` börjar annonsera den nya versionen.

### Steg 8 – verifiera uppdateringen

Öppna `chrome://extensions` på en testdator där VKBlock är tvångsinstallerat.

Kontrollera vilken version som är installerad.

Chrome söker automatiskt efter nyare versioner. Om administrationspolicyn tillåter kan en manuell kontroll initieras genom knappen **Uppdatera** i tilläggshanteringen.

Uppdateringar sker normalt med några timmars mellanrum och kan inte garanteras inom ett exakt tidsintervall.

När tillägget uppdaterats ska det nya versionsnumret visas.

Verifiera därefter att blockeringsregler, intern navigering, blockeringssida och inkognitoläge fortfarande fungerar.

### Steg 9 – distribution till befintliga användare

Ingen förändring i Google Admin ska normalt behövas vid en vanlig versionsuppdatering.

Befintliga installationer uppdateras automatiskt om:

- Det signerade paketet har samma tilläggs-ID.
- Versionsnumret är högre än tidigare.
- `updates.xml` pekar på rätt CRX-paket.
- Paketet är signerat med samma privata nyckel.
- Chrome kan nå uppdateringsadressen.

Det rekommenderas att nya versioner alltid verifieras på en begränsad testgrupp före bredare driftsättning.

Eftersom den aktuella distributionen använder samma uppdateringsadress för samtliga användare får alla klienter som omfattas av den adressen tillgång till den nya versionen när den publiceras.

För separat testning och produktionsdrift bör olika uppdateringskanaler eller separata tilläggsidentiteter övervägas.

---

## Säkerhet och begränsningar

VKBlock är avsett som ett administrativt stöd för att begränsa åtkomsten till utvalda webbadresser.

Det ska inte betraktas som ett fullständigt webbsäkerhetsfilter.

En URL-blockering innebär inte att innehållet i sig blockeras om samma innehåll kan nås genom en annan adress, domän eller tjänst.

Tillägget har breda webbplatsbehörigheter för att kunna stödja intern navigering på flera olika webbplatser. Koden bör därför granskas och testas vid förändringar.

VKBlock är utformat för att inte samla in eller överföra elevernas webbhistorik eller användaridentiteter.

Hämtning av den centrala blockeringslistan innebär dock vanlig nätverkskommunikation med GitHub Pages, där exempelvis klientens IP-adress kan behandlas av tjänsteleverantören.

Eftersom blockeringslistan distribueras offentligt via GitHub Pages ska den inte innehålla lösenord, personuppgifter eller annan skyddsvärd information.

## Teknik

VKBlock bygger på:

- Google Chrome Extensions Manifest V3
- Chrome Declarative Net Request API
- Chrome Storage API
- Chrome Alarms API
- JavaScript, HTML och CSS
- GitHub Pages
- Google Workspace for Education

## Projektstatus

**Version under test:** 1.0.2

**Verifierad distributionsmiljö:** Hanterad Chromebook via Google Admin.

**Test-OU:** TestShorts.

**Distribution:** Självhostat CRX-paket via GitHub Pages.

**Licens:** Någon programvarulicens har inte specificerats för detta repository. Koden är inte automatiskt licensierad för fri återanvändning enbart för att repositoryt är publikt.

---

VKBlock – central och flexibel URL-blockering för hanterade Chrome-miljöer.
