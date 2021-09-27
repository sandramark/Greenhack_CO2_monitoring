// This project was created as a solution for Greenhack.eu hackahton challenge - CO2 monitoring in schools
// The project is expecting to receive data from mttp broker (there was a testing broker set up for the hackathon)

var mqtt = require('mqtt')
var fs = require('fs')
var Mustache = require('mustache');

// create html file with code
var template = `  
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CO2 koncentrace</title>
    <style>
        html {
            font-size: 62.5%; /* nastavíme font na 10px */
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        *, ::before, ::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            min-height: 100vh;
            font-size: 1.6rem; 
            font-family: 'Ubuntu', sans-serif;
            margin: 0;
            padding: 0;
            background: rgb(235,215,195);
            background: linear-gradient(211deg, rgba(235,215,195,1) 0%, rgba(214,154,22,0.6222864145658263) 88%);
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            
        }
        h1 {
            color: black;       
            text-align: center;
            padding-top: 3rem;
            margin-bottom: 2rem;
            max-width: 100%;
        }
        .sub {
            vertical-align: sub;
            font-size: smaller;
        }

        main {
            max-width: 100%;
            height: 100vh;
            background-color: rgb(251, 241, 225);
            margin: 0 auto 0 auto;     
        }

        .table-item {
            margin: 1rem 2rem;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: .2rem .2rem .5rem .2rem rgba(0, 0, 0, 0.2);
        }

        .table-item_indicator {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            border: 0.1rem solid black;
        }

        .item-red {
            background-color: red;            
        }
        .item-green {
            background-color: rgb(43, 184, 43);            
        }
        .item-orange {
            background-color: orange;            
        }

        .legenda {
            max-width: 90%;
            margin: auto;
            padding: 0.5rem 2rem;
            /* border: 0.1rem solid black; */
            font-size: 1.2rem; 
            box-shadow: .2rem .2rem .5rem .2rem rgba(0, 0, 0, 0.2);
        }

        .legenda .legend-item {
            margin: 1rem 0rem;
            padding: 0 2rem;
            /* border: 0.1rem solid black; */
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .legenda .legend-item_indicator {
            border-radius: 50%;
            border: 0.1rem solid black;
            width: 1.2rem;
            height: 1.2rem;
            margin-right: 1rem;   
        }

        .air {
            text-align: right;
        }

        @media screen and (min-width: 30em) {
            main {
                max-width: 64rem;
                height: auto;
                margin-left: auto;
                margin-right: auto;
                padding: 10%;
            }

            h1 {
            margin-top: 1rem;
            margin-bottom: 2rem;
        }
            .legenda {
                margin-bottom: 5rem;    
            }
        }
        @media screen and (min-width: 80rem) {
            main {
                max-width: 84rem;
                margin: 5rem auto 5rem;
                height: 80vh;
                padding: 8rem;
            }
            .legenda {
                margin-top: 5rem;
            }
        }
    </style>
</head>
<body> 

    <main><h1>Koncentrace CO<span class="sub">2</span>  ve třídách</h1>
    <section class="table-data">
        <div class="table-item">
            <div class="table-item_room table-item_room1">room 1</div>
            <div class="table-item_concentration1">{{room1}}</div>
            <div class="table-item_indicator table-item_indicator1"></div>
        </div>

        <div class="table-item">
            <div class="table-item_room table-item_room2">room 2</div>
            <div class="table-item_concentration2">{{room2}}</div>
            <div class="table-item_indicator table-item_indicator2"></div>
        </div>

        <div class="table-item">
            <div class="table-item_room table-item_room3">room 3</div>
            <div class="table-item_concentration3">{{room3}}</div>
            <div class="table-item_indicator table-item_indicator3"></div>
        </div>
        <div class="legenda">
            <h3>Legenda:</h3>
            <div class="legend-item">
                <div class="legend-item_indicator item-green"></div>
                <p>CO2 Měření ≤ 800 ppm</p>
                <p class="air">Vysoká kvalita vzduchu</p>
            </div>
            <div class="legend-item">
                <div class="legend-item_indicator item-orange"></div>
                <p>CO2 Měření > 800-1.000 ppm</p>
                <p class="air">Průměrná kvalita vzduchu</p>
            </div>
            <div class="legend-item">
                <div class="legend-item_indicator item-red"></div>
                <p>CO2 Měření > 1.000-1.400 ppm</p>
                <p class="air">Nízká kvalita vzduchu</p>
            </div>
        </div>

    </section>
</main>

<script>
const tableItemConcentration1 = document.querySelector(".table-item_concentration1").innerText;
const tableItemConcentration2 = document.querySelector(".table-item_concentration2").innerText;
const tableItemConcentration3 = document.querySelector(".table-item_concentration3").innerText;

const tableItemIndicator1 = document.querySelector(".table-item_indicator1");
const tableItemIndicator2 = document.querySelector(".table-item_indicator2");
const tableItemIndicator3 = document.querySelector(".table-item_indicator3");

function colorIndicator(value, indicator) {
    if (value <= 800) {
        indicator.classList.add("item-green");
    }
    if (value >= 800 && value <= 1000) {
        indicator.classList.add("item-orange");
    } else {
        indicator.classList.add("item-red");
    }
}

const interval = setInterval(() => {
  colorIndicator(tableItemConcentration1, tableItemIndicator1);
  colorIndicator(tableItemConcentration2, tableItemIndicator2);
  colorIndicator(tableItemConcentration3, tableItemIndicator3);
}, 10);
</script>
</body>
</html>
`;

// establish connection with mqtt
var options = {
    clientId: "co2reader01",
    username: "user01",
    password: "_Us3r01",
}
var client = mqtt.connect('mqtt://20.71.117.212', options)

// subscribe to c02-meter
var topicSub = 'node/+/co2-meter/-/concentration';
client.on('connect', function () {
    console.log("connected")
    client.subscribe(topicSub, function (err) {
        if (!err) {
            client.publish('presence', 'Hello mqtt')
        }
    })
})


// getting co2 concentrations for different topic (rooms)
const co2Object = { room3: 799, room1: 799, room2: 799}
const co2DataArray = []
const classroomObject = {}

client.on('message', function (topic, message) {
    // message is Buffer
    const topic1 = topic.slice(5, 10)
    const concentration = Number(message)

    co2Object[topic1] = concentration
    console.log(co2Object)

    // client.end()

    var output = Mustache.render(template, co2Object);
    fs.writeFileSync("index.html", output);
})











// fs.writeFileSync("index.html", output);


// stepanb@DESKTOP-SLK4TBQ:/mnt/c/Users/stbechyn$ mosquitto_sub -h 20.71.117.212 -v -t "#" -u "user01" -P "_Us3r01"
// node/room1b/co2-meter/-/concentration 630
// node/room3b/co2-meter/-/concentration 741
// node/room2b/co2-meter/-/concentration 839
// node/room1a/co2-meter/-/concentration 1040
// node/room2a/co2-meter/-/concentration 788
// node/room3a/co2-meter/-/concentration 1088