const API_KEY = '2f1930d910d4dee82c07c48763d3f7c6';

async function findRefs() {
  console.log("Searching for Counterparty...");
  const cpRes = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: API_KEY,
      modelName: "Counterparty",
      calledMethod: "getCounterparties",
      methodProperties: {
        CounterpartyProperty: "Sender",
      }
    })
  });
  const cpData = await cpRes.json();
  
  if (cpData.success && cpData.data.length > 0) {
    const cp = cpData.data[0];
    console.log(`Found CP: ${cp.Description}, Ref: ${cp.Ref}`);

    console.log("Searching for Contact Person...");
    const contactRes = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: "Counterparty",
        calledMethod: "getCounterpartyContactPersons",
        methodProperties: {
          Ref: cp.Ref
        }
      })
    });
    const contactData = await contactRes.json();
    
    if (contactData.success && contactData.data.length > 0) {
      const contact = contactData.data[0];
      console.log(`Found Contact Person: ${contact.Description}, Ref: ${contact.Ref}`);
    } else {
      console.log("No contact persons found.");
      console.log("Contact Data:", JSON.stringify(contactData, null, 2));
    }
  } else {
    console.log("No counterparties found.");
    console.log("CP Data:", JSON.stringify(cpData, null, 2));
  }
}

findRefs();
