const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const eventsDirectory = path.join(process.cwd(), 'content/agenda');
const outputDirectory = path.join(process.cwd(), 'public');
const outputFilePath = path.join(outputDirectory, 'agenda-index.json');

function generateAgendaIndex() {
    const fileNames = fs.readdirSync(eventsDirectory);
    const events = fileNames.map(fileName => {
        const filePath = path.join(eventsDirectory, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
            ...data,
            content
        };
    });

    // Créez le répertoire 'public' s'il n'existe pas
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(events, null, 2));
    console.log('agenda-index.json generated successfully');
}

generateAgendaIndex();
