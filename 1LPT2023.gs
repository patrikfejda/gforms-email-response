EVENT_NAME = "LPT 2023 1.TURNUS"
REPLY_TO = "1lpt2023@trnavka.sk"
EMAIL_SUBJECT = "INFO K PLATBE"
SENDER_NAME = `${EVENT_NAME} | Oratko Trnávka`
IBAN = "SK1402000000001195005454"

SUMA_NEDOMKAR = "120"
SUMA_DOMKAR = "90"

EMAIL_BODY_TEXT = `
Dobrý deň,

Potvrdzujeme Vaše prihlásenie na ${EVENT_NAME}.
**Nezabudnite uhradiť zálohu do 7 dní, inak sa Vaše prihlásenie zruší.**

V prípade otázok nás kontaktujte na ${REPLY_TO}
`

OTHER_INFO = `
Ak ste v informáciách uviedli nesprávny údaj, kontaktujte nás na ${REPLY_TO}.
`

SIGNATURE = `
--
S pozdravom,
Oratko Trnávka

Tento email bol vygenerovaný automaticky,
prosím neodpovedajte naň.
`
//
//
//
// do not touch code beneath this line
//
//
//



function createFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var currentTriggers = ScriptApp.getProjectTriggers();
  if(currentTriggers.length > 0)
    return;  
  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
}

function onFormSubmit(e) { 
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var userEmail = formResponse.getRespondentEmail();
  var firstName = itemResponses[0].getResponse()
  var surname = itemResponses[1].getResponse()
  var birthday = itemResponses[3].getResponse()
  var domkarRaw = itemResponses[8].getResponse()
  var domkar = domkarRaw == "ÁNO"
  var AMOUNT = domkar ? SUMA_DOMKAR : SUMA_NEDOMKAR
  var birthdayYear = birthday.split("-")[0]
  var variableSymbol = birthday.replaceAll("-", "")
  var recipientMessage = `${EVENT_NAME} ${firstName} ${surname} ${birthdayYear}`
  recipientMessage = recipientMessage.replaceAll(" ", "+")
  recipientMessage = recipientMessage.normalize("NFD").replace(/\p{Diacritic}/gu, "")
  
  // delete multiple spaces
  // TODO redo to regex :)
  recipientMessage = recipientMessage.replaceAll("++", "+")
  recipientMessage = recipientMessage.replaceAll("++", "+")
  recipientMessage = recipientMessage.replaceAll("++", "+")
  recipientMessage = recipientMessage.replaceAll("++", "+")
  recipientMessage = recipientMessage.replaceAll("++", "+")
  
  var infoAboutPayment = `
IBAN: ${IBAN}
SUMA: ${AMOUNT} EUR
SPRÁVA PRE PRÍJEMCU: ${recipientMessage.replaceAll("+", " ")}
VARIABILNÝ SYMBOL: ${variableSymbol}
`


  var emailBody = EMAIL_BODY_TEXT + "\n";
  emailBody += "\nINFORMÁCIE O PLATBE:\n"
  emailBody += infoAboutPayment
  emailBody += `Platobný link: https://payme.sk/?V=1&IBAN=${IBAN}&AM=${AMOUNT}&CC=EUR&MSG=${recipientMessage}&PI=%2FVS${variableSymbol}%2FSS%2FKS`
  emailBody += "\n\n\n---------------------\nZHRNUTIE PRIHLÁSENIA:\n"
  itemResponses.forEach(function(itemResponse) {
    var title = itemResponse.getItem().getTitle().replaceAll(":", "").replaceAll("\n", " ");
    var response = itemResponse.getResponse();
    emailBody += title + ": " + response + "\n";
  });
  emailBody += OTHER_INFO
  emailBody += SIGNATURE
  
  sendEmail(userEmail, emailBody);
}

function sendEmail(emailAdress, emailBody) {
  MailApp.sendEmail(emailAdress, EMAIL_SUBJECT, emailBody, {name: SENDER_NAME});
}
