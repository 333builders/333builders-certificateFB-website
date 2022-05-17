import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useConnect, useNetwork } from "wagmi";
import LOGO from "../components/Logo";
import { useForm, SubmitHandler } from "react-hook-form";

const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

type Inputs = {
  name: string;
  wallet: string;
};

const Home: NextPage = (props) => {
  const [minted, setMinted] = useState(false);
  const isMounted = useIsMounted();
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

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setMinted(true);
  };

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
        <p className="text-xl">Congrats, here is your certificate!</p>
        <div className="w-[360px] h-40 relative">
          <Image
            src="/certificatetemplate.png"
            layout="fill"
            objectFit="cover"
          />
        </div>
        {connectors.map((x) => (
          <button
            className="btn btn-primary rounded-full"
            disabled={isMounted && !x.ready}
            key={x.name}
            onClick={() => connect(x)}
          >
            {x.id === "injected" ? (isMounted ? x.name : x.id) : x.name}
            {isMounted && !x.ready && " (unsupported)"}
            {loading && x.name === connector?.name && "…"}
          </button>
        ))}
        <p>Connect to your Metamask wallet to mint</p>
      </>
    );
  };

  const Minter = () => {
    return (
      <>
        <form
          className="form-control w-full max-w-lg card space-y-8 bg-slate-700"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card-body">
            <label className="label">
              <span className="label-text">What is your name?</span>
            </label>
            <input
              className="input "
              placeholder="Mario Rossi"
              {...register("name", { required: true })}
            />
            {errors.name && <span>This field is required</span>}

            <label className="label">
              <span className="label-text">
                Confirm mint the certificate to the following address
              </span>
            </label>
            <input
              className="input "
              placeholder="0x..."
              {...register("wallet", { required: true })}
            />
            {errors.wallet && <span>This field is required</span>}
            <div className="w-full pt-8">
              <input type="submit" className="w-full btn btn-primary " />
            </div>
          </div>
        </form>
      </>
    );
  };

  const Opensea = () => {
    return (
      <>
        <p className="text-3xl max-w-md text-center">
          The certificate is minted to your wallet, you can see it on Opensea!
        </p>
        <button
          className="btn btn-primary rounded-full"
          onClick={() => {
            const link = "https://opensea.io/";
            window.open(link, "_blank");
          }}
        >
          See my certificate
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
        <h2 className="text-3xl font-bold text-center pb-16">333.Builders</h2>
        <SwitchNetwork />
        {!connected ? (
          <Login />
        ) : (
          <>{!minted ? <Minter /> : <Opensea />}</>
        )}
      </div>
    </div>
  );
};

export default Home;
