// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
require('dotenv').config()

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
    const web3 = createAlchemyWeb3(
      process.env.URL,
    );
    const nfts = await web3.alchemy.getNfts({owner: req.body.address, contractAddresses: ["0x6be666719e7346488c795006eed2abe2d33b8e4c"] })
    const ownedNfts = nfts.ownedNfts
    ownedNfts.sort((a,b) => new Date(b.timeLastUpdated).getTime() - new Date(a.timeLastUpdated).getTime())
    res.status(200).json({ result: String(parseInt(ownedNfts[0].id.tokenId, 16)) })
  }
  catch (err) {
    res.status(500).json({ result: 'Error' })
  }
}
