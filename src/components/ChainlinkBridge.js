import "../index.scss";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { goerliABI } from "../constants/chainlinkABI";
import {
  optimismABI,
  goerliToMumbai,
  mumbaiToGoerliABI,
} from "../constants/chainlinkABI";
import ethereumIcon from "../assets/icons/meth.svg";
import { DataContext } from "../DataContext";
import Select from "react-select";
import { chainOptions, chainOptionsGoerliOptimism } from "../chainOptions";

const ChainlinkBridge = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [srcGoerliBridgeContract, setSrcGoerliBridgeContract] = useState(null);
  const [srcGoerliBridgeToMumbai, srcGoerliBridgeMumbai] = useState(null);
  const [srcMumbaiToGoerliContract, setSrcMumbaiToGoerliContract] =
    useState(null);

  const [srcOptimismBridgeContract, setSrcOptimismBridgeContract] =
    useState(null);
  const [selectedDstChain, setSelectedDstChain] = useState("Optimism Goerli");

  const [selectedAddLiquidityChain, setSelectedAddLiquidityChain] = useState(
    {}
  );

  console.log(selectedDstChain, "DSSST CHAIN");
  const web3 = new Web3(window.web3.currentProvider);

  const optimismAddress = "0x0A0FDdB2f265d2De819C616ebe7cFFb7c9175Cdc";
  const goerliAddress = "0xdEa5F3E7d16D98177b66d3E874723C2bb299eeb6";
  const goerliMumbaiAddress = "0x420E50B601E92933638b29DD273d8b692CdB3a9D";
  const mumbaiToGoerliAddress = "0x5BFef6EA00a2B15c97Ddd68b76F03200a010e627";

  const { userAccountAddress, setUserAccountAddress } =
    React.useContext(DataContext);

  const [srcChainSelected, setSelected] = React.useState("");
  console.log(userAccountAddress, "useracc addrr");
  /*   
for each option there should be a lock, owner has to have funds check that and throw error
button for the locks. 
  Optimism -> goerli
  Mumbai -> goerli
  goerli -> optimism, mumbai  
  */

  useEffect(() => {
    const loadBlockchainData = async () => {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      //const network = await web3.eth.net.getNetworkType();
      //await window.ethereum.enable();
      //const addressFromMetamask = await web3.eth.getAccounts();
      const chainId = await web3.eth.getChainId();
      console.log(chainId);
      if (chainId !== 5) {
        setErrorMsg("Please connect your address to the Goerli test network");
      }

      const goerliContract = new web3.eth.Contract(goerliABI, goerliAddress);
      const mumbaiContract = new web3.eth.Contract(
        goerliToMumbai,
        goerliMumbaiAddress
      );

      const mumbaiToGoerliContract = new web3.eth.Contract(
        mumbaiToGoerliABI,
        mumbaiToGoerliAddress
      );

      const optimismContract = new web3.eth.Contract(
        optimismABI,
        optimismAddress
      );
      setSrcGoerliBridgeContract(goerliContract);
      setSrcOptimismBridgeContract(optimismContract);
      srcGoerliBridgeMumbai(mumbaiContract);
      setSrcMumbaiToGoerliContract(mumbaiToGoerliContract);
    };
    loadBlockchainData();
  }, []);

  const selectSrcChain = (event) => {
    setSelected(event.target.value);
  };

  const selectDstChain = (event) => {
    console.log(event.target.value, "wat is val?");
    setSelectedDstChain(event.target.value);
  };
  //Different arrays for different dropdowns
  const polygon = ["Ethereum Goerli"];
  const optimism = ["Ethereum Goerli"];
  const goerli = ["Optimsim Goerli", "Polygon Mumbai"];

  let type = null;
  let options = null;

  //Setting Type variable according to dropdown
  if (srcChainSelected === "Polygon Mumbai") {
    type = polygon;
  } else if (srcChainSelected === "Optimism Goerli") {
    type = optimism;
  } else if (srcChainSelected === "Ethereum Goerli") {
    type = goerli;
  }

  if (type) {
    options = type.map((el) => <option key={el}>{el}</option>);
  }

  const clickAddLiqudity = async () => {
    let connectedChainId = await web3.eth.net.getId();
    console.log(connectedChainId, "CONNECTED ID");
    if (connectedChainId === 5 && userAccountAddress) {
      if (selectedAddLiquidityChain.value === "opt") {
        console.log("Inside opt callt");
        web3.eth.sendTransaction({
          to: optimismAddress,
          data: srcOptimismBridgeContract.methods
            .ownerAddBridgeLiqudity()
            .encodeABI(),
          value: 1000,
          from: userAccountAddress[0],
        });
      } else {
        web3.eth.sendTransaction({
          to: goerliAddress,
          data: srcGoerliBridgeContract.methods
            .ownerAddBridgeLiqudity()
            .encodeABI(),
          value: 1000,
          from: userAccountAddress[0],
        });
      }
    } else {
      setErrorMsg(
        "Please make sure you are connected to the Goerli network in your wallet!"
      );
    }
  };

  console.log(srcGoerliBridgeToMumbai, "Mumbai contract");

  const initiateSwap = (type) => {
    if (userAccountAddress) {
      if (srcChainSelected === "Optimism Goerli") {
        web3.eth.sendTransaction({
          to: optimismAddress,
          data: srcOptimismBridgeContract.methods
            .lockTokensForGoerli()
            .encodeABI(),
          value: 1003,
          from: userAccountAddress[0],
        });
      } else if (srcChainSelected === "Polygon Mumbai") {
        console.log(
          srcGoerliBridgeMumbai.methods,
          goerliMumbaiAddress,
          "BÄÄÄÄEÄEÄEÄ"
        );
        web3.eth.sendTransaction({
          to: mumbaiToGoerliAddress,
          data: srcMumbaiToGoerliContract.methods
            .lockTokensForGoerli()
            .encodeABI(),
          value: 1003,
          from: userAccountAddress[0],
        });
      } else if (srcChainSelected === "Ethereum Goerli") {
        if (selectedDstChain === "Optimism Goerli") {
          web3.eth.sendTransaction({
            to: goerliAddress,
            data: srcGoerliBridgeContract.methods
              .lockTokensForOptimism()
              .encodeABI(),
            value: 1003,
            from: userAccountAddress[0],
          });
        } else if (selectedDstChain === "Polygon Mumbai")
          console.log("GOT IN polygon mumbai", goerliMumbaiAddress);

        web3.eth.sendTransaction({
          to: goerliMumbaiAddress,
          data: srcGoerliBridgeToMumbai.methods
            .lockTokensForOptimism()
            .encodeABI(),
          value: 1003,
          from: userAccountAddress[0],
        });
      }
    } else {
      setErrorMsg(
        "You need to connect your wallet to the Goerli network to be able to bridge."
      );
    }
  };

  return (
    <div className="container py-5 app-market">
      <div class="alert alert-secondary" role="alert">
        <div className="row p-1">
          <h3>User</h3>
        </div>

        <div className="row p-1">
          <label>From</label>

          <div className="col">
            {" "}
            <select className="form-select" onChange={selectSrcChain}>
              <option>Choose...</option>
              <option>Polygon Mumbai</option>
              <option>Optimism Goerli</option>
              <option>Ethereum Goerli</option>
            </select>
          </div>
        </div>
        <div className="row p-1">
          <label>To</label>
          <div className="col">
            {" "}
            <select className="form-select" onChange={(e) => selectDstChain(e)}>
              {
                // Render the options based on users first selection
                options
              }
            </select>
          </div>
        </div>
      </div>{" "}
      <div className="col">
        {" "}
        <button
          style={{
            width: "100%",
            marginBottom: 20,
            backgroundColor: "cadetblue",
          }}
          onClick={() => initiateSwap()}
          className="btn"
        >
          Lock 1000 WEI To Bridge
        </button>
      </div>
      <div class="alert alert-secondary" role="alert">
        <div className="row p-1">
          <h3>Owner</h3>
        </div>{" "}
        <div className="row p-1">
          <div className="col">
            {" "}
            <label for="cars">Network/Chain</label>
            <Select
              options={chainOptionsGoerliOptimism}
              value={selectedAddLiquidityChain}
              onChange={setSelectedAddLiquidityChain}
            />
          </div>
          <label>Add Liqudity Amount</label>

          <div className="col">
            {" "}
            <button
              onClick={() => clickAddLiqudity()}
              className="btn"
              style={{
                width: "100%",
                backgroundColor: "cadetblue",
                marginBottom: 30,
              }}
            >
              Add Bridge Liquidity ETH
            </button>
          </div>
        </div>
        <div className="row p-1">
          <div className="col">
            {" "}
            <label for="cars">
              {" "}
              Send WETH to this address [for Goerli to Mumbai bridge]
            </label>
            <a
              style={{
                width: "30%",
                backgroundColor: "cadetblue",
                marginLeft: "15%",
              }}
              href="https://goerli.etherscan.io/address/0x5BFef6EA00a2B15c97Ddd68b76F03200a010e627"
              class="btn"
            >
              0x5BF...e627
            </a>
          </div>
        </div>
        <div
          style={{
            marginTop: 15,
          }}
          className="row p-1"
        >
          <div className="col">
            {" "}
            <label for="cars">
              {" "}
              Send MATIC to this address [for Mumbai to Goerli bridge]
            </label>
            <a
              style={{
                width: "30%",
                backgroundColor: "cadetblue",
                marginLeft: "15%",
              }}
              href=" https://goerli.etherscan.io/address/0x420E50B601E92933638b29DD273d8b692CdB3a9D"
              class="btn"
            >
              0x420...3a9D
            </a>
          </div>
        </div>
      </div>{" "}
      {errorMsg ? (
        <div class="alert alert-error" role="alert">
          {errorMsg}
        </div>
      ) : null}
    </div>
  );
};

export default ChainlinkBridge;
