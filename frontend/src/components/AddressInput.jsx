import { useState } from "react";

function AddressInput({ onAnalyze, loading }) {

  const [address, setAddress] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!address.trim()) {
      return;
    }

    onAnalyze(address.trim());
  };

  return (
    <form
      className="address-form"
      onSubmit={handleSubmit}
    >

      <div className="input-wrapper">

        <span className="input-icon">
          ₿
        </span>

        <input
          type="text"
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
          placeholder="Enter a Bitcoin address..."
          disabled={loading}
        />

      </div>

      <button
        type="submit"
        className="analyze-button"
        disabled={loading || !address.trim()}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

    </form>
  );
}

export default AddressInput;