import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useConnect, useNetwork, useContractWrite, useAccount, useContractEvent, useSigner, useWaitForTransaction } from "wagmi";
import LOGO from "../components/Logo";
import { useForm, SubmitHandler } from "react-hook-form";
import Abi from '../../public/CertificateFB333Builders.json'
import { TailSpin } from 'react-loader-spinner'
import { BigNumber } from "ethers";
import {AiOutlineSearch} from "react-icons/ai"

const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

type Inputs = {
  name: string;
};

const Home: NextPage = (props) => {
  const [minted, setMinted] = useState(false);
  const isMounted = useIsMounted();
  const [tx, setTx] = useState('')
  const [ready, isReady] = useState(false)
  const [idNft, setId] = useState(0)
  const [{ data: accountData, error: error_user, loading: loading_user }, disconnect] = useAccount()
  const [{ data: data_signer, error: error_signer, loading: loading_signer }, getSigner] = useSigner()
  const [
    {
      data: { connector, connectors, connected },
      error,
      loading,
    },
    connect,
  ] = useConnect();
  const [{ data: networkData, error: switchNetworkError }, switchNetwork] =
    useNetwork();

    const addPolygon = async () => {
      await window.ethereum.request({ method: 'wallet_addEthereumChain',
         params:[
          {"chainName":"Polygon Mainnet",
          "rpcUrls":["https://polygon-rpc.com/","https://rpc-mainnet.matic.network","https://matic-mainnet.chainstacklabs.com","https://rpc-mainnet.maticvigil.com","https://rpc-mainnet.matic.quiknode.pro","https://matic-mainnet-full-rpc.bwarelabs.com"],
          "nativeCurrency":{"name":"MATIC","symbol":"MATIC","decimals":18},
          "chainId":'0x89',
          "blockExplorerUrls":["https://polygonscan.com"]
         }
        ]
      });
      }

  const SwitchNetwork = () => {
    return (
      <>
        {switchNetwork && networkData.chain.id !== 137 && (
          <button
            className="btn btn-primary rounded-full"
            onClick={() => addPolygon()}
          >
            Switch to Polygon
          </button>
        )}
        {switchNetwork && networkData.chain.id == 137 && <></>}
      </>
    );
  };

  const Login = () => {
    return (
      <>
        {connectors.map((x) => (
          <button
            className="btn btn-primary rounded-full"
            key={x.name}
            onClick={() => {
              isMounted && x.ready ? connect(x) : window.open("https://metamask.io/", "_blank");
            } 
            } 
          >
            {x.id === "injected" ? (isMounted && x.ready ? x.name : "") : x.name}
            {isMounted && !x.ready && " Please, install metamamsk"}
            {loading && x.name === connector?.name && "…"}
          </button>
        ))}
        <p>Connect to your wallet to mint</p>
      </>
    );
  };

  const Minter = () => {
    const [load, isLoading] = useState(false)
    const [name, setName] = useState('')
    const [templateWhite, setTemplateWhite] = useState(true)
    const [errorMint, setErrorMint] = useState('')

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async () => {

      isLoading(true)
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template: templateWhite ? 'white' : 'black', name: name, address: accountData.address })
      });
      if (response.ok) {
        const json_response = await response.json();
        setTx(json_response.result)
        isReady(true)
      }
      else {
        setErrorMint("Transaction failed. Remember you can mint once")
      }
      isLoading(false)
    };
    
    const ButtonSubmit = () => {
      return (
        <>
          <div className="w-full pt-8">
            <input type="submit" className="w-full btn btn-primary " value="create certificate" />
          </div>
        </>
      )
    }

    const ButtonLoading = () => {
      return (
        <>
          <div className="w-full pt-8 text-center">
            <TailSpin color="#FFF" height={40} width={40} wrapperStyle={{ justifyContent: "center" }} />
          </div>
        </>
      )
    }

    const Pending = () => {
          
      useContractEvent(
        {
          addressOrName: '0xDC8A8B2fD5132197b1BDbA3233f387B4593f6012',
          contractInterface: Abi.abi,
          signerOrProvider: data_signer
        },
        'Transfer',
        (event) => {
          if(event[1] == accountData.address) {
            let id = BigNumber.from(event[2])
            setId(id.toNumber())
            setMinted(true)
            setTx('')
            isReady(false)
          }
        }
      )  

      const url_tx = "https://polygonscan.com/tx/" + tx

      return (
        <>
        <div>
        <p className="text-2xl max-w-md text-center">
        Pending transaction...
        </p>
        <ButtonLoading/>
          <p className="text-2xl max-w-md text-center pt-4">View on Polygonscan <a href={url_tx} target="_blank"><AiOutlineSearch className="inline"/></a></p>
        </div>
        </>
      )

    }

    return (
      <>
      {ready && <Pending />}
      {!ready && 
        <form
          className="form-control w-full max-w-lg card space-y-8 bg-slate-700"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card-body">
            {!ready &&
              <>
                <label className="label">
                  <span className="label-text">What is your name/nickname?</span>
                </label>
                <input
                  maxLength={30}
                  className="input "
                  placeholder="Mario Rossi, MarioRossi7..."
                  {...register("name", {
                    required: true,
                    onChange: (event) => {
                      setName(event.target.value)
                    },
                    disabled: load
                  })
                  }
                />
                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="text-center">
                  <input type="radio" id="white" name="template" value="" defaultChecked={templateWhite} onClick={() => { setTemplateWhite(!templateWhite);}}/>
                  <label htmlFor="white" className="pl-2">White</label>
                  </div>
                  <div className="text-center">
                  <input type="radio" id="black" name="template" value="" defaultChecked={!templateWhite} onClick={() => { setTemplateWhite(!templateWhite)}}></input>
                  <label htmlFor="black" className="pl-2">Black</label>
                  </div>
                </div>
                <div className="pt-8 text-center flex-grow">
                  {templateWhite ? (
                    <Image
                    src="/binco.jpg"
                    alt="template white"
                    width={350}
                    height={350}
                  />
                  ) : (
                    <Image
                    src="/nero.jpg"
                    alt="template black"
                    width={350}
                    height={350}
                  />
                  )}
                </div>
                </>}
                {errors.name && <span>This field is required</span>}
                {load && <ButtonLoading />}
                {!load && <ButtonSubmit />}
                {errorMint}
              </div>
        </form>
       }
      </>
    );
  };

  const Opensea = () => {

    const url_opensea = "https://opensea.io/assets/matic/0xDC8A8B2fD5132197b1BDbA3233f387B4593f6012/" + idNft
    return (
      <>
        <p className="text-2xl max-w-md text-center">
          The certificate is minted to your wallet, you can view it on Opensea!
        </p>
        <button
          className="btn btn-primary rounded-full"
          onClick={ () => {
            window.open(url_opensea, "_blank");
          }}
        >
          View on Opensea
        </button>
        <button
          className="btn btn-primary rounded-full"
          onClick={() => {
            const link = "https://333builders.com/";
            window.open(link, "_self");
          }}
        >
          Go to 333.Builders
        </button>
      </>
    );
  };

  return (
    <div>
      <Head>
        <title>333.Builders</title>
        <meta name="description" content="333.Builders" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
        <LOGO />
        <h2 className="text-3xl font-bold text-center pb-8">333.Builders</h2>
        <SwitchNetwork />
        {!connected ? (
          <Login />
        ) : (
          <>{networkData.chain.id === 137 &&
            <>{!minted ? <Minter /> : <Opensea/>}</>
          }</>
        )}
      </div>
    </div>
  );
};

export default Home;
