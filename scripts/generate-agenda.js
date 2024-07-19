const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const eventsDirectory = path.join(process.cwd(), 'content/agenda');

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

    fs.writeFileSync('public/agenda-index.json', JSON.stringify(events, null, 2));
}

generateAgendaIndex();
