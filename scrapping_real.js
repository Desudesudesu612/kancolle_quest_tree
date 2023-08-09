import puppeteer from "puppeteer";
import * as fs from "fs";


const getQuotes = async () => {
    // Web scraping code will go here
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
    });
    const page = await browser.newPage(); //open new page
    const url = "https://en.kancollewiki.net/Quests"; //what the website is
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        request.abort();
      } else {
        request.continue();
      } 
    });

    await page.goto(url), {
        waitUntil: "domcontentloaded",
    };
    
    const tableData = await page.evaluate(() => {
      const tableList = document.querySelectorAll('table');
      
      return Array.from(tableList).map((table) => {
        const rows = table.querySelectorAll('tr');
  
        // Define an array to store the table data
        const data = [];
  
        // Loop through each row and extract the cell values
          rows.forEach((row) => {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];

            cells.forEach((cell) => {
                rowData.push(cell.textContent.trim());
              });

            data.push(rowData);
          });          
          return data;
        })       
    });
    await browser.close();
    return(tableData)
  };
  

export async function webscrapping(){
  try {
    const fulldata = await getQuotes();
    
    let QuestsList = [];
    let id_change = [];
    for (let i = 1; i < fulldata.length; i++){

      let Seasonal = ["Cs3", "Cs4", "Cs5","Cs1","Cs2"];

      if (fulldata[i][0][1] == "Rewards") {
        
        for (let j = 1; j < fulldata[i].length; j = j + 6){

          if (Seasonal.includes(fulldata[i][j][0])) { continue; }
          //assign each quest to its own object and push it to QuestList
          let [id, title, fuel, ammo, steel, bauxite] = fulldata[i][j];
          let description = fulldata[i][j + 1][0];
          let requirement = fulldata[i][j + 2][0];
          let prerequisite = fulldata[i][j + 3][1];
          let notes = fulldata[i][j + 4];
          
          let ids = {};
          let quest = {};
          quest.id = "";
          quest.new_id = id;
          quest.title = title;
          quest.reward = {fuel, ammo, steel, bauxite};
          quest.description = description;
          quest.requirement = requirement;
          quest.prerequisite = prerequisite;
          quest.notes = notes;
          
          const splitter = "Old ID: "
          
          if (quest.notes[1].includes(splitter)) {
          

            const regexpNames = /Old ID: ([A-Z]\d+)/gm;
            for (const match of quest.notes[1].matchAll(regexpNames)) {
              
              quest.id = match[1];
              ids.new = match[1];
              ids.old = quest.new_id;
              id_change.push(ids);
            }


          } else {
            quest.id = quest.new_id;
          }
          
          delete quest.new_id
          

          QuestsList.push(quest);
        }
      }
    }
    
    
    
    //remove month substring from each id
    const substringsToRemove = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Spring", "Summer", "Autumn", "Winter"];
    QuestsList.forEach(quest => {
      
      quest.id = substringsToRemove.reduce((acc, substring) => {
        return acc.replace(new RegExp(substring, 'g'), '');
      }, quest.id);
      quest.prerequisite = substringsToRemove.reduce((acc, substring) => {
        return acc.split(substring).join('');
      }, quest.prerequisite);
    });
    id_change.forEach(removal => {
      removal.old = substringsToRemove.reduce((acc, substring) => {
        return acc.replace(new RegExp(substring, 'g'), '');
      }, removal.old);
    })
  
    
    QuestsList.forEach(quest => {
      id_change.forEach(replacement => {
        const pattern = '\\b' + replacement.old + '\\b';
        const regex = new RegExp(pattern, 'g');
        quest.prerequisite = quest.prerequisite.replace(regex, replacement.new);
        
      });
    })

    //make links file list for tree
    const links = [];
    //prerequisite is the source and id is the target --> prerequisite = parents, id = chidlren
    
    QuestsList.forEach(quest => {
        let source_target = {}
            let preq_quest = quest.prerequisite.split(",");
            
            preq_quest.forEach(quest => {
              if (quest.includes("Seasonal Exercises Quests")) {
              
                preq_quest.pop();
                
              }
            })
              
           
            
            const prerequisite_quest = preq_quest.map(str => str.trim());
            
            if (prerequisite_quest.length > 1) { //have more than one prerequisite
                prerequisite_quest.forEach(prereq => {
                    source_target.source = prereq;
                    source_target.target = quest.id;
                    links.push(source_target);
                });
            } if (quest.prerequisite.length > 1 && prerequisite_quest.length == 1) { //if only have one prerequisite
                source_target.source = prerequisite_quest[0];
                source_target.target = quest.id;
                links.push(source_target);
            } //exclude no prerequisite
      });

  
    const linking = JSON.stringify(links, null, 2);
    const questlistfile = JSON.stringify(QuestsList, null, 2);
    fs.writeFile("lists.json", linking, (error) => {
      if (error) {
        console.error(error);
        throw error;
      }

      console.log("lists.json written correctly")
    })
    fs.writeFile("QuestList.json", questlistfile, (error) => {
      if (error) {
        console.error(error);
        throw error;
      }

      console.log("QuestList.json written correctly")
    })

  } catch (error) {
    console.error("rejected:", error);
  }
}

webscrapping();


