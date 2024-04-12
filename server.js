const express = require("express")
const app = express()

const HTTP_PORT = process.env.PORT || 8080

const path = require("path")

app.use(express.urlencoded({ extended: true }))
app.use(express.static("assets"))


const parkingList = []

// /home endpoint
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"))
})

//admin endpoint.
app.get("/admin", (req, res) => {
    //admin page
    res.sendFile(path.join(__dirname, "admin.html"))
})

//pay endpoint
app.post("/pay", (req, res) => {
    console.log("[DEBUG] POST request received at the / endpoint")
    console.log("Data received from form is:")
    console.log(req.body)

    //1: Extracting data from the form 

    const parkingType = req.body.list
    const hoursFromForm = req.body.hours
    const lisenceFromForm = req.body.lisence

    const hoursToUse = parseFloat(hoursFromForm)

    //2. Form data validation for parking

    // a.
    if (lisenceFromForm === "" || hoursFromForm === "") {
        res.send(`<div>
                    <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
                    ERROR: You must provide all required fields.</p>
                    </div>`)
        return
    }

    // b.
    if (isNaN(hoursFromForm) === true) {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: You must provide a number for the hours to park.</p>
        </div>`)
        return
    }

    // c.
    if (hoursFromForm < 1 || hoursFromForm > 8) {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: minimum number of hours is 1 and maximum is 8.</p>
        </div>`)
        return
    }

    let subTotal = 0
    let tax = 0; //*0.13 of subTotal
    let total = 0
    let hourlyRate = 0

    //parking type A
    if (parkingType === "parkingA") {
        hourlyRate = 5.00
        subTotal = hourlyRate * hoursToUse
        tax = 0.13 * subTotal
        total = subTotal + tax
    }

    //parking type B
    if (parkingType === "parkingB") {
        hourlyRate = 10.00
        subTotal = hourlyRate * hoursToUse
        tax = 0.13 * subTotal
        total = subTotal + tax
    }

    //Underground Parking
    if (parkingType === "parkingC") {
        hourlyRate = 15.00
        subTotal = hourlyRate * hoursToUse
        tax = 0.13 * subTotal
        total = subTotal + tax
    }

    //Object literal to store client receipt
    const receipt = {
        plate: lisenceFromForm,
        hours: hoursFromForm,
        Rate: hourlyRate,
        parkingLot: parkingType,
        SubTot: subTotal,
        Tax: tax,
        Final: total
    }

    //Push the receipt info to a list
    parkingList.push(receipt)
    console.log(receipt)    //for confirmation on console

    console.log("[DEBUG] Customer added, total number of cars is: " + parkingList.length)
    res.send(`
    <div>
    <h1>Your Receipt:</h1>
    <p>License: ${lisenceFromForm}</p>
    <p>Hours Requested: ${hoursFromForm}</p>
    <p>Hourly Rate: $${hourlyRate} per hour</p>
    <p>Sub total: $${subTotal.toFixed(2)}</p>
    <p>Total: $${total.toFixed(2)}</p>
    <p>Tax: $${tax.toFixed(2)}</p>
    <h3>You must pay: $${total.toFixed(2)}</h3>
    </div>`)
})

//login endpoint
app.post("/login", (req, res) => {
    console.log("[DEBUG] GET request received at the /admin endpoint")
    console.log("Data received from form is:")
    console.log(req.body)

    const userId = req.body.username
    const passCode = req.body.password
    //user admin validations
    // a.
    if (userId === "" || passCode === "") {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: You must provide all required fields</p>
        </div>`)
        return
    }

    // b.
    if (userId !== "admin") {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: Incorrect Username/Password.</p>
        </div>`)
        return
    }

    // c.
    if (passCode != "0000") {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: Incorrect Username/Password.</p>
        </div>`)
        return
    }

    // d.
    if (passCode.length !== 4) {
        res.send(`<div>
        <p style="color:red; background-color: yellow; font-weight: bold; font-size: 16px;">
        ERROR: Incorrect Password</p>
        </div>`)
    }

    let grandTotal = 0

    for (let i = 0; i < parkingList.length; i++)(
        grandTotal = grandTotal + parkingList[i].Final
    )

    console.log("Total amount collected: $" + grandTotal)

    res.send(`<div style = "font-weight:bold; font-size:16px">
    <p>Total number of cars parked: ${parkingList.length}</p>
    <p>Total amount collected: $${(grandTotal.toFixed(2))}</p>
    </div>`)
})

// ----------------
// code to start server
const onHttpStart = () => {
    console.log(`Express web server running on port: ${HTTP_PORT}`)
    console.log(`Press CTRL+C to exit`)
}

app.listen(HTTP_PORT, onHttpStart)