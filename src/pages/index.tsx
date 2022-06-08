import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useConnect, useNetwork, useContractWrite, useAccount } from "wagmi";
import LOGO from "../components/Logo";
import { useForm, SubmitHandler } from "react-hook-form";
import Abi from '../../public/CertificateFB333Builders.json'
import { TailSpin } from 'react-loader-spinner'

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
  const [cid, setCid] = useState('')
  const [ready, isReady] = useState(false)
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

  const SwitchNetwork = () => {
    return (
      <>
        {switchNetwork && networkData.chain.id !== 137 && (
          <button
            className="btn btn-primary rounded-full"
            onClick={() => switchNetwork(137)}
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

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async (data) => {

      isLoading(true)
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template: templateWhite ? 'white' : 'black', name: name })
      });
      if (response.ok) {
        const json_response = await response.json();
        setCid(json_response.result)
        isReady(true)
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

    const ButtonMint = () => {
      const [message, setMessage] = useState('')
      const [load, isLoading] = useState(false)
      const [{ data, error, loading }, write] = useContractWrite(
        {
          addressOrName: '0xC8b05f4ABaB41A84a1822F072C569DCEc0048C25',
          contractInterface: Abi.abi,
        },
        'mint',
        {
          args: cid,
        }
      )

      const ButtonLife = () => {
        return (
          <>
            <button
              className='w-full btn btn-primary'
              onClick={async () => {
                isLoading(true)
                const tx = await write()
                if (tx.data !== undefined) {
                  await tx.data.wait()
                }
                if (tx.error !== undefined) {
                  setMessage('Error, remember you can mint once')
                }
                else {
                  setMinted(true)
                }
                isLoading(false)
              }}>MINT</button>
          </>
        )
      }

      return (
        <div className="w-full pt-8">
          {load ? <ButtonLoading /> : <ButtonLife />}
          <div className="pt-4">{message}</div>
        </div>
      )
    }

    return (
      <>
        <form
          className="form-control w-full max-w-lg card space-y-8 bg-slate-700"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card-body">
            {ready && <p className="text-center">Certificate is ready, now you can mint it and create your NFT!</p>
            }
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
                      setCid('')
                      isReady(false)
                      setName(event.target.value)
                    },
                    disabled: load
                  })
                  }
                />
                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="text-center">
                  <input type="radio" id="white" name="template" value="" checked={templateWhite} onClick={() => { setTemplateWhite(!templateWhite);}}/>
                  <label htmlFor="white" className="pl-2">White</label>
                  </div>
                  <div className="text-center">
                  <input type="radio" id="black" name="template" value="" checked={!templateWhite} onClick={() => { setTemplateWhite(!templateWhite)}}></input>
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
                {!load && !ready && <ButtonSubmit />}
                {!load && ready && <ButtonMint />}
              </div>
        </form>
      </>
    );
  };

  const Opensea = () => {

    const [{ data: accountData }, disconnect] = useAccount()

    const [loadOpen,isLoadingOpen] = useState(false)

    async function retrieveTokenURL() {
      console.log(accountData.address)
      if(accountData?.address) {
        const response = await fetch('/api/retrieveid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address: accountData.address })
        });
        if (response.ok) {
          const json_response = await response.json();
          return "https://opensea.io/assets/matic/0xC8b05f4ABaB41A84a1822F072C569DCEc0048C25/"+json_response.result
        }
        else return "https://opensea.io"
      }
      else return "https://opensea.io"
    }

    return (
      <>
        <p className="text-3xl max-w-md text-center">
          The certificate is minted to your wallet, you can see it on Opensea!
        </p>
        <button
          className="btn btn-primary rounded-full"
          onClick={ async () => {
            isLoadingOpen(true)
            const link = await retrieveTokenURL();
            window.open(link, "_blank");
            isLoadingOpen(false)
          }}
        >
          {!loadOpen ? <p>See my certificate</p> : <TailSpin color="#FFF" height={40} width={40} wrapperStyle={{ justifyContent: "center" }} />}
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
            <>{!minted ? <Minter /> : <Opensea />}</>
          }</>
        )}
      </div>
    </div>
  );
};

export default Home;
