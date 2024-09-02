let jwt = sessionStorage.getItem('jwt')

document.getElementById('logoutButton').addEventListener('click', logout);
logoutButton.innerText = "Logout"

function logout() {
    sessionStorage.removeItem('jwt')
    window.location.href = '/'
}

let query = `
{
    user {
        firstName
        lastName
        login
        email
        id
        campus
        auditRatio
        totalUp
        totalDown
    }
}
`

fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
    },
    body: JSON.stringify ({
        query: query
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    return response.json()
})
.then(data => {
    let userInfo = data.data.user;
    
    const welcome = document.getElementById('hello')
    welcome.innerHTML = `
        Welcome, <span class="prenomNom"> ${userInfo[0].firstName} ${userInfo[0].lastName} </span>    
    `

    const info = document.getElementById('userInfo')
    info.innerHTML = `
        <p>User ID: ${userInfo[0].id}</p>
        <p>Login: ${userInfo[0].login}</p>
    `

    const done = Math.round(userInfo[0].totalUp*10) / 100000
    const received = Math.round(userInfo[0].totalDown*10) / 100000

    const xpRatio = document.createElement('div')
    xpRatio.classList.add('xpRatio')

    const xpUP = document.createElement('div')
    xpUP.classList.add('xpUP')

    const xpLeft = document.createElement('div')
    xpLeft.classList.add('xpLeft')

    const xpRight = document.createElement('div')
    xpRight.classList.add('xpRight')

    const pDone = document.createElement('p')
    pDone.classList.add('pDone')
    pDone.innerHTML = `${done} MB done`
    pDone.style.color = "black"
    const pReceived = document.createElement('p')
    pReceived.classList.add('pReceived')
    pReceived.innerHTML = `${received} MB received`
    pReceived.style.color = "black"

    const ratio = Math.round(userInfo[0].auditRatio* 10) / 10
    const xpBottom = document.createElement('div')
    xpBottom.classList.add('xpBottom')
    xpBottom.innerHTML = `
        <p class="auditRatio"> <span class="ratio"> ${ratio}</span> <span class="text"> Good job ! </span> </p>    
    `

    /*const auditRatio = xpBottom.querySelector('auditRatio')
    const text = xpBottom.querySelector('text')
    if (ratio >= 1.4) {
        auditRatio.style.color = "green"
        text.textContent = "Good job !"
    } else if (ratio >= 1) {
        auditRatio.style.color = "orange"
        text.textContent = "You can do better !"
    } else {
        auditRatio.style.color = "red"
        text.textContent = "0 KDA"
    }*/

    let svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
    svg.setAttribute("width", '200')
    svg.setAttribute("height", '100')
    svg.setAttribute("rx", "20")
    
    const bar1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar1.textContent = '${done} Done';
    bar1.setAttribute("x", "0");
    bar1.setAttribute("y", "20");
    bar1.setAttribute("height", "10");
    bar1.setAttribute("width", done);
    bar1.setAttribute("fill", "#DC143C");
    bar1.setAttribute("rx", "5");
    bar1.setAttribute("transform", "translate(15,10)")
    svg.appendChild(bar1)

    const bar2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar2.textContent = '${received} Received';
    bar2.setAttribute('x', "0");
    bar2.setAttribute('y', '40');
    bar2.setAttribute("height", "10");
    bar2.setAttribute("width", received);
    bar2.setAttribute("fill", "rgb(51, 153, 204)");
    bar2.setAttribute("rx", "5");
    bar2.setAttribute("transform", "translate(15,20)")
    svg.appendChild(bar2);

    xpRight.append(
        pDone,
        pReceived
    )
    xpLeft.appendChild(svg)
    xpUP.append(
        xpLeft,
        xpRight
    )
    xpRatio.append(
        xpUP,
        xpBottom
    )
    const topBar = document.querySelector('.topBar')
    topBar.appendChild(xpRatio)

})
.catch(error => {
    console.error('There has been an error with your fetch operation: ', error)
})

let query2 = `
{
  user {
    transactions(order_by: {createdAt: asc}){
      type
    	amount
  	}
  }
}
`

/* Pour les skills == 
    -> Refaire une requete query 
    -> récupérer les datas
    -> Les mettre dans un tableau 
    -> Vérifier que la data contient 'skills' et ensuite 'amount'
    -> On les prends et on les balance dans une autre fonction qui sort les plus grandes
*/


fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
    },
    body: JSON.stringify ({
        query: query2
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    return response.json()
})
.then(data => {
    const tab = data.data.user[0].transactions
   allSkills = []

   tab.forEach(element => {
    if (element.type.includes("skill_")) {
        allSkills.push(element)
    }
   })

   tabEach = [[]]

   allSkills.forEach(element => {
    let found = false; // Indicateur pour savoir si on a trouvé un tableau avec le même type

    // Vérifier chaque sous-tableau de tabEach
    tabEach.forEach(skill => {
        // Si le type du premier élément du sous-tableau correspond au type de l'élément courant
        if (tabEach[0].length === 0) {
            tabEach[0].push(element)
            found = true
        } else if (skill[0].type === element.type) {
            skill.push(element); // Ajouter l'élément à ce sous-tableau
            found = true; // Indiquer qu'on a trouvé le tableau correspondant
            return; // Sortir de la boucle pour cet élément
        }
    });

    // Si aucun tableau avec le même type n'a été trouvé
    if (!found) {
        let newTab = []; // Créer un nouveau tableau
        newTab.push(element); // Ajouter l'élément à ce nouveau tableau
        tabEach.push(newTab); // Ajouter ce nouveau tableau à tabEach   
    }
    });

    tabMax = []
    for (let i = 0 ; i < tabEach.length; i++) {
        max = getMaxValue(tabEach[i])
        tabMax.push(max)
    }
    console.log(tabMax)

    const userSkill = document.getElementById('userSkill')
    

    tabMax.forEach(element => {

        const skillName = document.createElement('p')
        skillName.innerHTML += `
        <p class="skillName"> ${element.type} : ${element.amount} </p>
        `
        skillName.style.fontFamily = "arial, sans serif"
        
        let background = document.createElement('div')
        background.classList.add('background')

        let svg2 = document.createElementNS('http://www.w3.org/2000/svg','svg')
        svg2.setAttribute("width", '200')
        svg2.setAttribute("height", '70')
        svg2.setAttribute("rx", "20")

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute("d", "M 20 50 C 100 30, 150 70, 180 50"); // Définition du chemin
        path.setAttribute("stroke", "gray");
        path.setAttribute("stroke-width", "12");
        path.setAttribute("stroke-linecap", "round")
        path.setAttribute("fill", "transparent");

        let pathColor = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        pathColor.setAttribute("d", "M 20 50 C 100 30, 150 70, 180 50")
        pathColor.setAttribute("stroke", getRandomColor());
        pathColor.setAttribute("stroke-width", "13");
        pathColor.setAttribute("stroke-linecap", "round");
        pathColor.setAttribute("fill", "transparent");
        pathColor.setAttribute("stroke-dasharray", `${element.amount} 110%`);
        pathColor.setAttribute("stroke-dashoffset", "0");

        background.append(
            skillName,
            svg2
        )
        svg2.append(
            path,
            pathColor
        )
        userSkill.appendChild(background)
    })
    document.body.appendChild(userSkill)
})

function getMaxValue(arr) {
    return arr.reduce((maxObj, currentObj) => {
      return currentObj.amount > maxObj.amount ? currentObj : maxObj;
    }, arr[0]);
}

function getRandomColor() {
    const colors = [
      "#FF69B4", // hot pink
      "#33CC33", // lime green
      "#66CCCC", // sky blue
      "#FFCC00", // orange
      "#CC0099", // magenta
      "#0099CC", // teal
      "#9900CC", // purple
      "#33FFFF", // cyan
      "#666666", // dark gray
      "#CCCCCC", // light gray
      "#FF9900", // coral
      "#3399CC", // blue-green
      "#9966CC", // plum
      "#6699CC", // blue-violet
      "#CC6600" // golden brown
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

