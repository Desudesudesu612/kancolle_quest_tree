import puppeteer from "puppeteer";



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
   
    //console.log(tableData[6]);
   
    
    await browser.close();
    return(tableData)
  };
  

export async function webscrapping(){
  try {
    const fulldata = await getQuotes();
    
    let QuestsList = []
    for (let i = 1; i < fulldata.length; i++){
      if (fulldata[i][0][1] == "Rewards") {
        
        for (let j = 1; j < fulldata[i].length; j = j + 6){

          //assign each quest to its own object and push it to QuestList
          let [id, title, fuel, ammo, steel, bauxite] = fulldata[i][j];
          let description = fulldata[i][j + 1][0];
          let requirement = fulldata[i][j + 2][0];
          let prerequisite = fulldata[i][j + 3][1];

          let quest = {}
          quest.id = id;
          quest.title = title;
          quest.reward = {fuel, ammo, steel, bauxite};
          quest.description = description;
          quest.requirement = requirement;
          quest.prerequisite = prerequisite;
          QuestsList.push(quest);
        }
      }
    }
    //console.log(QuestsList);
    //make links file list for tree
    const links = [];
    //prerequisite is the source and id is the target --> prerequisite = parents, id = chidlren
    
    QuestsList.forEach(quest => {
        let source_target = {}
            let preq_quest = quest.prerequisite.split(",");
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
    
    // console.log(links);

    return [links, QuestsList];
    //make_svg(links, QuestsList); //to make svg

  } catch (error) {
    console.error("rejected:", error);
  }
}



