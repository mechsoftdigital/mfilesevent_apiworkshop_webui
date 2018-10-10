var MFModule = (function () {

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

    return {
        getMFConfig: function () {
            return mfConfig;
        },

        getConnectionInfo : function () {
            return connectionInfo;
        }
    };
})();

var UIModule = (function () {

    var DomObjects = {
        applicationName : '.navbar-brand',
        footerText : '.footer_text',
        sendButton : '#send',
        nameInput : '#name',
        identityInput : '#identity',
        requestTypeInput : '#request_type',
        descInput : '#description'

    };

    var DomPlaceHolders = {
        companyName : '%Company_Name%',
        date : '%Current_Date%'
    };


    return {

        blockUI : function() {
            $.blockUI();
        },

        unBlockUI : function (){
            $.unblockUI();
        },

        setApplicationName : function (name) {
            document.querySelector(DomObjects.applicationName).innerHTML = name;
        },

        setFooterText: function (companyname, date) {
            var footerText = document.querySelector(DomObjects.footerText);

            if (footerText !== null && footerText !== 'undefined') {
                footerText.innerHTML = footerText.innerHTML.replace(DomPlaceHolders.companyName, companyname);
                footerText.innerHTML = footerText.innerHTML.replace(DomPlaceHolders.date, date);
            }

        },

        getDomObjects : function () {
            return DomObjects;
        },

        getformValues : function () {
            return {
                name : document.querySelector(DomObjects.nameInput).value,
                identity: document.querySelector(DomObjects.identityInput).value,
                requestType : document.querySelector(DomObjects.requestTypeInput).value,
                description : document.querySelector(DomObjects.descInput).value
            };
        },

        showMessage: function (message) {
            alert(message);
        },

        validateInputs : function () {

            var validationResult = {
                allvalid: true,
                message : ""
            };

            var inputValues = this.getformValues();

            if (inputValues.name.trim() === "" || inputValues.identity.trim() === "" || inputValues.description === "") {
                validationResult.allvalid = false;
                validationResult.message = "Lütfen tüm alanları doldurunuz.";

                return validationResult;
            }

            if (inputValues.identity.length < 10 || inputValues.identity.length > 11) {
                validationResult.allvalid = false;
                validationResult.message = "TC Kimlik No / VKN alanı minimum 10 maksimum 11 haneli olmalıdır.";

                return validationResult;
            }

            return validationResult;
        },

        changeURL : function (url){
            window.location.href = url;
        }
    };

})();

var ServiceModule = (function (UICtrl, MFCtrl) {

    this.ConnectionInfo = MFCtrl.getConnectionInfo();

    this.tokenInt = null;

    var mfconfig = MFCtrl.getMFConfig();

    var getAuthToken = async function () {

        return fetch(ConnectionInfo.restPath +  '/server/authenticationtokens', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },        
            body: JSON.stringify({Username: ConnectionInfo.userName, Password: ConnectionInfo.password, VaultGuid: ConnectionInfo.vaultGuid}),
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // *client, no-referrer
        }).then((response) => { return response.json(); })
            .then((result) => {

            return result;
        }).catch(function(error) {
            UICtrl.showMessage("M-Files sunucusundan hata ile karşılaşıldı." + error);
            UICtrl.unBlockUI();
            console.log(error);
        });

    };

    var sendRequest = async function (jsonBody, path, requestType) {

        var request = {
            method: requestType,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Authentication' : tokenInt
            },        

            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // *client, no-referrer
        }

        if (requestType == 'post' && (jsonBody !== null || jsonBody !== 'undefined')){
            request.body = JSON.stringify(jsonBody);
        }

        return fetch(ConnectionInfo.restPath +  path, request)
            .then((response) => { 
            return response.json(); 
        })
            .then((result) => {
            return result;
        }).catch(function(error) {
            UICtrl.showMessage("M-Files sunucusundan hata ile karşılaşıldı." + error);
            UICtrl.unBlockUI();
            console.log(error);
        });
    };

    return {

        getToken : async function(){ 

            if (ConnectionInfo === null){
                console.log("Connection info is not set. Please set connection info first.");
                return;
            }

            //GET Auth Token
            var token =  await getAuthToken();

            if ("Exception" in token){
                UICtrl.unBlockUI();
                UICtrl.showMessage(token.Message);
                return;
            }


            tokenInt = token.Value;

            console.log("Token captured: "+ token.Value);
        }, 

        queryIdentity : async function(identity){

            var result = await sendRequest(null, "/objects/"+mfconfig.contactObjectType+"?p"+mfconfig.IdentityNoProp+"=" + identity, "get");
            return result;

        },

        createRequest: async function(inputValues){
            if (tokenInt === null){
                console.log("Please getToken first.");
                UICtrl.showMessage("Sistemde bir hata oluştu. Token bulunamadı.")
            }

            //1. prepare json body for creating a GDPR Request

            var requestBody =  {
                PropertyValues : [],
                Files : []
            }

            //Add properties
            requestBody.PropertyValues.push({
                PropertyDef: 100,
                TypedValue : {
                    DataType:9,
                    Lookup: {
                        Item : mfconfig.requestClass,
                        Version: -1
                    }
                }
            })

            requestBody.PropertyValues.push({
                PropertyDef : 38,
                TypedValue: {
                    DataType : 9,
                    Lookup : {
                        Item : mfconfig.requestWorkflow,
                        Version: -1
                    }
                }
            })

            requestBody.PropertyValues.push({
                PropertyDef : 39,
                TypedValue: {
                    DataType : 9,
                    Lookup : {
                        Item : mfconfig.requestState,
                        Version: -1
                    }
                }
            })

            //Add description
            requestBody.PropertyValues.push({
                PropertyDef: mfconfig.descriptionProp,
                TypedValue: {
                    DataType: 13,
                    Value: inputValues.description
                }
            });


            //Add contact
            requestBody.PropertyValues.push({
                PropertyDef : mfconfig.requestedByProp,
                TypedValue: {
                    DataType : 9,
                    Lookup : {
                        Item : inputValues.contactId,
                        Version: -1
                    }
                }
            })


            //Add request Type
            requestBody.PropertyValues.push({
                PropertyDef : mfconfig.requestTypeProp,
                TypedValue: {
                    DataType : 9,
                    Lookup : {
                        Item : inputValues.requestType,
                        Version: -1
                    }
                }
            })

            //2. pass path and json body to function
            var result = await sendRequest(requestBody, "/objects/" +mfconfig.requestObjectType + ".aspx?checkIn=true", "post");

            return result;


        },

        createContact : async function(contactValues){
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
                        Item : mfconfig.otherContactClass,
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
                PropertyDef: mfconfig.nameProp,
                TypedValue: {
                    DataType: 1,
                    Value: firstName
                }
            });

            //Add lastname
            requestBody.PropertyValues.push({
                PropertyDef: mfconfig.lastNameProp,
                TypedValue: {
                    DataType: 1,
                    Value: lastName
                }
            });

            //Add identity
            requestBody.PropertyValues.push({
                PropertyDef: mfconfig.IdentityNoProp,
                TypedValue: {
                    DataType: 1,
                    Value: contactValues.identity
                }
            });

            //2. pass path and json body to function
            var result = await sendRequest(requestBody, "/objects/" +mfconfig.contactObjectType + ".aspx?checkIn=true", "post");

            return result;

        }
    }

})(UIModule, MFModule);

var app = (function(UICtrl, SrvCtrl){

    var domObjects = UICtrl.getDomObjects();

    var setupEventListeners = function(){
        document.querySelector(domObjects.sendButton).addEventListener('click', sendClicked)
    }

    var sendClicked =  async function(e){

        e.preventDefault();

        var validationResult = UICtrl.validateInputs();

        if (!validationResult.allvalid){
            UICtrl.showMessage(validationResult.message);
            return;
        }

        var inputValues = UICtrl.getformValues();

        UICtrl.blockUI();

        //Get Token
        await SrvCtrl.getToken();

        //Query Identity No
        var results = await SrvCtrl.queryIdentity(inputValues.identity);

        var contactId;

        if ("Exception" in results)
        {

            UICtrl.unBlockUI();
            UICtrl.showMessage(results.Message);       
            return;
        }

        if (results.Items.length == 0){
            //Create Contact
            var contactObject = await SrvCtrl.createContact(inputValues);

            if ("Exception" in contactObject)
            {

                UICtrl.unBlockUI();
                UICtrl.showMessage(contactObject.Message);       
                return;
            }

            console.log("New contact created in M-Files.");

            contactId = contactObject.ObjVer.ID;
        }
        else {
            contactId = results.Items[0].ObjVer.ID;
            console.log("Using existing contact in M-Files.");
        }

        var mfValues = {
            contactId : contactId,
            description : inputValues.description

        }

        //Define requestType
        if (inputValues.requestType == 1){
            mfValues.requestType = 3
        }
        else {
            mfValues.requestType = 2;
        }

        //Send request data
        var createdRequest = await SrvCtrl.createRequest(mfValues);

        if ("Exception" in createdRequest){

            UICtrl.unBlockUI();
            UICtrl.showMessage(createdRequest.Message);       
            return;
        }

        console.log("Request created in M-Files.");


        UICtrl.changeURL("completed.html");

    }

    return {
        init: function (){

            console.log("Application started.");

            UICtrl.setApplicationName("Kişisel Veri Talebi Portalı");

            UICtrl.setFooterText("Mechsoft", new Date().toLocaleDateString());

        },

        setupEventListeners : function(){
            setupEventListeners();
        }
    }

})(UIModule, ServiceModule);