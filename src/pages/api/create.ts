import type { NextApiRequest, NextApiResponse } from 'next'
require('dotenv').config()
const path = require('path')
const { Readable } = require("stream")
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
const { registerFont, createCanvas, loadImage } = require('canvas')
registerFont(path.join(process.cwd(), '/public/SpaceGrotesk-Regular.ttf'), { family: 'San Serif' })
import Abi from '../../../public/CertificateFB333Builders.json'
const { ethers } = require("ethers");
const axios = require('axios').default;

type Data = {
  result: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (req.method !== 'POST') {
    res.status(400).json({ result: 'Bad request' })
    return
  }

  try {

    const canvas = createCanvas(1050, 1050)
    const ctx = canvas.getContext('2d')

    if (req.body.template == 'white') {
      loadImage(path.join(process.cwd(),'/public/bianco_1050.jpg')).then((image) => {
        ctx.drawImage(image, 0, 0)
        ctx.textAlign = "center";
        ctx.font = '35px Space Grotesk'
        ctx.fillStyle = "#bf0022"
        ctx.fillText(req.body.name, 525, 684)
      })
    }
    else {
      loadImage(path.join(process.cwd(),'/public/nero_1050.jpg')).then((image) => {
        ctx.drawImage(image, 0, 0)
        ctx.textAlign = "center";
        ctx.font = '35px Space Grotesk'
        ctx.fillStyle = "#bc0020";
        ctx.fillText(req.body.name, 525, 684)
        console.log(canvas.toDataURL())
      })
    }

    const stream = canvas.createJPEGStream()
    stream.path = "pinata_issue.png" //read more here https://github.com/PinataCloud/Pinata-SDK/issues/28#issuecomment-816439078
    const options_image = {
      pinataMetadata: {
        name: req.body.name+'_image'
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    const res_image = await pinata.pinFileToIPFS(stream, options_image)
    const cid = res_image.IpfsHash
    const url_image = "https://ipfs.io/ipfs/" + cid
    const metadata = {
      "description": '333.Builders is a community of talents, professionals, investors and enthusiasts of the Blockchain and Web3 world. We aims to become the first Venture Builder and Investment DAO founded by Italian minds. Reach us here: 333builders.com',
      "external_url": "333builders.com",
      "image": url_image,
      "name": "Web3 in tokens",
      "attributes": [
        {
          "trait_type": "Course",
          "value": "#333.Academy"
        },
        {
          "trait_type": "Year",
          "value": "2022"
        }
      ]
    }
    const options_metadata = {
      pinataMetadata: {
        name: req.body.name+'_metadata'
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    var stream_metadata = Readable.from(JSON.stringify(metadata), { encoding: 'utf8' })
    stream_metadata.path = "pinata_issue.png" //read more here https://github.com/PinataCloud/Pinata-SDK/issues/28#issuecomment-816439078
    const res_metadata = await pinata.pinFileToIPFS(stream_metadata, options_metadata)
    var data = '{\r\n    "jsonrpc":"2.0",\r\n    "method":"eth_gasPrice",\r\n    "params":[],\r\n    "id":0\r\n}\r\n';
    var config = {
      method: 'post',
      url: process.env.URL,
      headers: { 
        'Content-Type': 'text/plain'
      },
      data : data
    };
    const response = await axios(config)
    const gasPrice = ethers.BigNumber.from(response.data.result)
    const provider = new ethers.providers.AlchemyProvider("matic", process.env.API_KEY)
    const walletPrivateKey = new ethers.Wallet(process.env.PRIVATE_KEY)
    const wallet = walletPrivateKey.connect(provider)
    const smart_contract = new ethers.Contract("0xDC8A8B2fD5132197b1BDbA3233f387B4593f6012", Abi.abi, wallet)
    const tx_try = await smart_contract.callStatic.safeMint("https://ipfs.io/ipfs/" + res_metadata.IpfsHash, req.body.address, { gasPrice: gasPrice.toNumber()*2, gasLimit: 300000})
    const tx = await smart_contract.safeMint("https://ipfs.io/ipfs/" + res_metadata.IpfsHash, req.body.address, { gasPrice: gasPrice.toNumber()*2, gasLimit: 300000})
    res.status(200).json({ result: tx.hash })
  }
   catch (err) {
     res.status(500).json({ result: 'Error' })
  }
}
