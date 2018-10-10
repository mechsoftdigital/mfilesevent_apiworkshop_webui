var mfConfig = {
    requestObjectType : 129,
    requestClass : 40,
    requestWorkflow : 110,
    requestState : 154,
    requestTypeProp : 1156,
    requestedByProp : 1154,
    contactObjectType : 104,
    IdentityNoProp : 1232,
    otherContactClass : 19,
    nameProp : 1036,
    lastNameProp : 1037,
    statusWorkflow: 101,
    statusState: 101,
    descriptionProp : 1061
};

var connectionInfo = {
    vaultGuid : "{EF1088F0-BD04-4CA4-AF60-05AC7277F927}",
    userName: "kvkk.sistemyoneticisi",
    password: "1",
    restPath: "http://localhost/REST"
};

var domObjects = {
    applicationName : '.navbar-brand',
    footerText : '.footer_text',
    sendButton : '#send',
    nameInput : '#name',
    identityInput : '#identity',
    requestTypeInput : '#request_type',
    descInput : '#description'
};

var domPlaceHolders = {
    companyName : '%Company_Name%',
    date : '%Current_Date%'
};


//Set App Name
document.querySelector(domObjects.applicationName).innerHTML = "Kişisel Veri Talep Portalı";

//Set Footer Text
var footerText = document.querySelector(domObjects.footerText);
if (footerText !== null && footerText !== 'undefined') {
    footerText.innerHTML = footerText.innerHTML.replace(domPlaceHolders.companyName, "Mechsoft");
    footerText.innerHTML = footerText.innerHTML.replace(domPlaceHolders.date, new Date().toLocaleDateString());
}


//Define Click Event
var sendClicked  = function (e) {

    //Prevent default button click
    e.preventDefault();
    
    //TODO: Validation of Input Values
};


document.querySelector(domObjects.sendButton).addEventListener('click', sendClicked);
