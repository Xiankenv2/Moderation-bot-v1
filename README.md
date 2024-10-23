# Discord Moderation Bot

## Functionaliteiten

- **Auto Moderatie**: Automatische detectie en handhaving van serverregels.
- **Ban**: Verwijder leden die zich niet aan de regels houden.
- **Warn**: Geef waarschuwingen aan leden bij ongepast gedrag.
- **Kick**: Verwijder leden van de server.
- **Timeout**: Tijdelijke schorsing van leden.
- **Training**: Organiseer trainingssessies binnen de server.
- **Events**: Beheer evenementen en meldingen.
- **Add Roles**: Voeg rollen toe aan leden met één commando.
- **Bug Reporting**: Rapporteren van bugs binnen de server.
- **Suggesties**: Leden kunnen suggesties indienen voor serververbeteringen.
- **Member Info**: Informatie over leden opvragen.
- **Whois**: Gedetailleerde informatie over een specifiek lid.
- **Polls**: Creëer en beheer peilingen binnen de server.
- **Regels**: Toon de serverregels aan leden.
- **Tickets met Auto Response Functie**: Maak tickets voor vragen of problemen met automatische reacties.

## Vereisten

Om deze bot te draaien, heb je het volgende nodig:
- **Node.js**: Zorg dat je de nieuwste versie van Node.js hebt geïnstalleerd.
- **Visual Studio Code** (of een andere code-editor naar keuze).
- **Discord Developer Account**: Voor het verkrijgen van een Discord-token.
- **Mongoose Account**: Voor het beheren van de MongoDB-database.
- **2-3 GB opslagruimte**: Voor data-opslag en logbestanden.
- **Nodemon**: Voor het automatisch herstarten van de bot tijdens ontwikkeling.

## Installatie

Volg deze stappen om de bot op te zetten:

1. **Installeer Node.js**  
   Download en installeer Node.js van [nodejs.org](https://nodejs.org/).

2. **Clone de Repository**  
   Open een terminal en voer het volgende commando uit:
   ```bash
   git clone <repository-url>
   ```

3. **Installeer Nodemon**  
   Dit pakket is handig om de bot automatisch te herstarten tijdens de ontwikkeling:
   ```bash
   npm install -g nodemon
   ```

4. **Installeer de vereiste pakketten**  
   In de map van de bot, installeer alle benodigde dependencies:
   ```bash
   npm install
   ```

5. **Configureer de Bot**  
   Maak een `config.json`-bestand aan en voeg je Discord-token, MongoDB-URI en andere vereiste configuratie-instellingen toe. Zorg ervoor dat je de benodigde API-sleutels hebt van de Discord Developer Portal.
   

7. **Start de Bot**  
   Gebruik het volgende commando om de bot te starten met Nodemon:
   ```bash
   nodemon index.js
   ```

## Gebruik

- Voeg de bot toe aan jouw server via de Discord Developer Portal.
- ```bash
   https://discord.com/oauth2/authorize?client_id=(YOUR_CLIENDID/BOTID)&permissions=8&integration_type=0&scope=bot
   ```
- De bot kan nu commando’s uitvoeren zoals het bannen van leden, automatische waarschuwingen, en meer. 
- Raadpleeg de documentatie voor een lijst met beschikbare commando’s en hoe je ze kunt gebruiken.

## Optioneel

Als je ervoor kiest om een aangepaste database of een zelf-gehoste MongoDB te gebruiken, moet je dit configureren in het `Warns/ ticket config.js`-bestand en mogelijk in de botcode aanpassen.

## suggetie
Suggettie? pls dm me xianken (1185678867831214080) 
or join my dc: https://discord.gg/46cGKA8QMd
