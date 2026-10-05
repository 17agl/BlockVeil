import { useState } from "react";


function AddressInput({
  onAnalyze,
  loading
}) {

  const [address, setAddress] =
    useState("");


  const handleSubmit =
    (event) => {

      event.preventDefault();

      const cleanAddress =
        address.trim();

      if (!cleanAddress || loading) {
        return;
      }

      onAnalyze(
        cleanAddress
      );
    };


  return (
    <form
      className="address-form"
      onSubmit={handleSubmit}
    >

      <div className="input-wrapper">

        <label htmlFor="bitcoin-address">
          Bitcoin Address
        </label>

        <input
          id="bitcoin-address"

          type="text"

          value={address}

          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }

          placeholder="Enter a public Bitcoin address"

          disabled={loading}

          autoComplete="off"
        />

      </div>


      <button
        type="submit"

        className="analyze-button"

        disabled={
          loading ||
          !address.trim()
        }
      >

        {loading
          ? "Analyzing..."
          : "Analyze"}

      </button>

    </form>
  );
}


export default AddressInput;