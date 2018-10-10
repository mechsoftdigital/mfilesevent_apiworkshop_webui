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

    //Get form values
    var formValues = {
        name : document.querySelector(domObjects.nameInput).value,
        identity: document.querySelector(domObjects.identityInput).value,
        requestType : document.querySelector(domObjects.requestTypeInput).value,
        description : document.querySelector(domObjects.descInput).value
    };

    console.log(formValues);

    //Validate required fields.
    if (formValues.name.trim() === "" || formValues.identity.trim() === "" || formValues.description === "") {
        alert("Lütfen tüm alanları doldurunuz."); 
        return;
    }

    //Validate Identity fields.
    if (formValues.identity.length < 10 || formValues.identity.length > 11) {
        alert("TC Kimlik No / VKN alanı minimum 10 maksimum 11 haneli olmalıdır.");
        return;
    }

    $.blockUI();

    var getToken = async function(){
        return fetch(connectionInfo.restPath +  '/server/authenticationtokens', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },        
            body: JSON.stringify({Username: connectionInfo.userName, Password: connectionInfo.password, VaultGuid: connectionInfo.vaultGuid}),
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' })
            .then((response) => { return response.json(); })
            .then((result) => {return  result;})
            .catch(function(error) { console.log(error); alert("Hata !");});
    };

    var sendRequest = async function (token, jsonBody, path, requestType) {

        var request = {
            method: requestType,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Authentication' : token
            },        

            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // *client, no-referrer
        }

        if (requestType == 'post' && (jsonBody !== null || jsonBody !== 'undefined')){
            request.body = JSON.stringify(jsonBody);
        }

        return fetch(connectionInfo.restPath +  path, request)
            .then((response) => { 
            return response.json(); 
        })
            .then((result) => {
            return result;
        }).catch(function(error) {
            console.log(error);
        });
    };

    var createContact = function(contactValues){
        var requestBody =  {
            PropertyValues : [],
            Files : []
        }

        //Add class
        requestBody.PropertyValues.push({
            PropertyDef: 100,
            TypedValue : {
                DataType:9,
                Lookup: {
                    Item : mfConfig.otherContactClass,
                    Version: -1
                }
            }
        })

        //Split names and last names

        var allword = contactValues.name.split(' ');
        var firstName = "";
        var lastName = "";

        for (var i=0; i < allword.length; i++){
            if (i != allword.length -1){
                firstName = firstName + " " + allword[i];
            }
            else {
                lastName = allword[i];
            }

        }

        //Add firstname
        requestBody.PropertyValues.push({
            PropertyDef: mfConfig.nameProp,
            TypedValue: {
                DataType: 1,
                Value: firstName
            }
        });

        //Add lastname
        requestBody.PropertyValues.push({
            PropertyDef: mfConfig.lastNameProp,
            TypedValue: {
                DataType: 1,
                Value: lastName
            }
        });

        //Add identity
        requestBody.PropertyValues.push({
            PropertyDef: mfConfig.IdentityNoProp,
            TypedValue: {
                DataType: 1,
                Value: contactValues.identity
            }
        });

        //Add workflow
        requestBody.PropertyValues.push({
            PropertyDef: 38,
            TypedValue : {
                DataType:9,
                Lookup: {
                    Item : mfConfig.statusWorkflow,
                    Version: -1
                }
            }
        })

        //Add state
        requestBody.PropertyValues.push({
            PropertyDef: 39,
            TypedValue : {
                DataType:9,
                Lookup: {
                    Item : mfConfig.statusState,
                    Version: -1
                }
            }
        })

        return requestBody;
    };


    getToken().then(token => {
        if ("Exception" in token){
            $.unblockUI();
            alert(token.Message);
            console.log(response);

            return;
        }

        console.log("Captured token.");
        console.log(token);

        var tokenValue = token.Value;

        //Query Identity
        sendRequest(tokenValue, null, "/objects/"+mfConfig.contactObjectType+"?p"+mfConfig.IdentityNoProp+"=" + formValues.identity, "get").then(response => {
            if ("Exception" in response){
                alert(response.Message);
                console.log(response);
                return;
            }
            console.log("Query completed.");
            console.log(response);

            var contactObjectVersion;


            if (response.Items.length == 0){

                //No contact found with identity create contact.

                console.log("Contact not found. Creating new contact.");

                contact = createContact(formValues);

                sendRequest(tokenValue, contact, "/objects/" +mfConfig.contactObjectType + ".aspx?checkIn=true", "post").then(response => {
                    if ("Exception" in response){
                        alert(response.Message);
                        console.log(response);
                        return;
                    }
                    console.log("Contact Created.");
                    console.log(response);
                    contactObjectVersion = response;
                });

            } else {

                //Contact found with given Identity use it.

                console.log("Found contact with Identity.");
                contactObjectVersion = response.Items[0];
            }
            
            //TODO: Create GDPR Request

        });


    });

    $.unblockUI();

};


document.querySelector(domObjects.sendButton).addEventListener('click', sendClicked);
