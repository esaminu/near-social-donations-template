const donation_contract_id = "%DONATION_CONTRACT_ACCOUNT_ID%";

if (!donation_contract_id) {
  return (
    <Markdown
      text={
        "Please pass in the accountId of the donation contract as a `donation_contract_id` prop"
      }
    />
  );
}

State.init({
  donations: [],
  beneficiaryAccountId: null,
  donationAmount: "",
});

State.update({
  beneficiaryAccountId: Near.view(donation_contract_id, "get_beneficiary"),
});

const number_of_donors = Near.view(donation_contract_id, "number_of_donors");
const min = number_of_donors > 10 ? number_of_donors - 9 : 0;
State.update({
  donations:
    Near.view(donation_contract_id, "get_donations", {
      from_index: min.toString(),
      limit: number_of_donors,
    }) || [],
});

const setDonation = (amount) => {
  const { body: data } = fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd"
  );
  const near2usd = data["near"]["usd"];
  const amount_in_near = amount / near2usd;
  const rounded_two_decimals = Math.round(amount_in_near * 100) / 100;
  State.update({ donationAmount: rounded_two_decimals });
};

const donationsTable = (
  <div className="col-sm-8 pe-2 pe-sm-5">
    <h4> Latest Donations </h4>

    <table className="table table-striped">
      <thead>
        <tr>
          <th scope="col">User</th>
          <th scope="col">Total Donated Ⓝ</th>
        </tr>
      </thead>
      <tbody id="donations-table">
        {state.donations.map((donation, i) => (
          <tr key={i}>
            <th scope="row">{donation.account_id}</th>
            <td>{Math.round(donation.total_amount / Math.pow(10, 24))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const donationBoxHeader = (
  <div
    style={{
      textAlign: "center",
      backgroundColor: "#fff",
      margin: 0,
      borderRadius: "8px 8px 0 0",
      padding: "1em 0em 2em 0em",
    }}
  >
    <img
      src="https://cdn.iconscout.com/icon/free/png-256/near-protocol-5382313-4498185.png"
      style={{
        backgroundPosition: "center 0em",
        backgroundRepeat: "no-repeat",
        position: "relative",
        top: "-2.5em",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: "50px",
        width: "50px",
        boxShadow: "#bbb 0px 2px 5px",
      }}
    />

    <h4>
      Donate to
      <label
        for="beneficiary"
        data-behavior="beneficiary"
        style={{ color: "#0072CE", borderBottom: "2px solid #0072CE" }}
      >
        {state.beneficiaryAccountId}
      </label>
    </h4>
  </div>
);

const submitDonation = (
  <div
    style={{
      padding: "2em",
      textAlign: "justify",
      backgroundColor: "#f2f2f2",
      zIndex: 1,
      borderRadius: "0 0 8px 8px",
    }}
  >
    <div className="row">
      <div className="col-3 px-1">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDonation(10)}
        >
          $ 10
        </button>
      </div>
      <div className="col-3 px-1">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDonation(20)}
        >
          $ 20
        </button>
      </div>
      <div className="col-3 px-1">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDonation(50)}
        >
          $ 50
        </button>
      </div>
      <div className="col-3 px-1">
        <button
          class="btn btn-outline-primary"
          onClick={() => setDonation(100)}
        >
          $ 100
        </button>
      </div>
    </div>

    <div style={{ margin: "0.2em -0.5em -1em -0.5em" }}>
      <div id="fieldset" style={{ border: "none", padding: "2em 0" }}>
        <label for="donation" class="form-label">
          Donation amount (in Ⓝ)
        </label>
        <div className="input-group">
          <input
            id="donation"
            className="form-control"
            data-behavior="donation"
            onChange={(e) => State.update({ donationAmount: e.target.value })}
            value={state.donationAmount}
            type="number"
            min="0"
          />
          <span className="input-group-text">Ⓝ</span>
          <button
            className="btn btn-primary"
            onClick={() =>
              Near.call(
                donation_contract_id,
                "donate",
                {},
                null,
                state.donationAmount * Math.pow(10, 24)
              )
            }
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  </div>
);

const pleaseSignIn = (
  <div
    style={{
      padding: "2em",
      textAlign: "justify",
      backgroundColor: "#f2f2f2",
      zIndex: 1,
      borderRadius: "0 0 8px 8px",
    }}
  >
    <p>Please sign in with your NEAR wallet to make a donation.</p>
    <p style={{ textAlign: "center", marginTop: "2.5em" }}>
      <button id="sign-in-button" class="btn btn-primary">
        Sign in
      </button>
    </p>
  </div>
);

return (
  <div className="p-4 p-sm-5">
    <div className="row">
      {donationsTable}
      <div className="col-sm-4">
        <div
          className="mt-md-4"
          style={{
            maxWdth: "24em",
            boxShadow: "#bac4cd 0px 0px 18px",
            borderRadius: 8,
          }}
        >
          {donationBoxHeader}
          {context.accountId == null ? pleaseSignIn : submitDonation}
        </div>
      </div>
    </div>
  </div>
);
