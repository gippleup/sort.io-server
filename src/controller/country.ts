import { ExpressController } from "./types"
import {getCountryNameFromLatLng, getIconNameFromCountry} from './country/util';
import fs from "fs";

type CountryController = {
  icon: ExpressController,
}

const controller: CountryController = {
  icon: async (req, res) => {
    const {lat, lng} = req.query;
    if (!lat || !lng) return res.send('위도 경도 값 확인좀')
    const country = await getCountryNameFromLatLng(Number(lat), Number(lng));
    const fileName = getIconNameFromCountry(country) + '.svg';
    const filePath = `${__dirname}/country/svg/${fileName}`;
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      res.status(200)
      res.sendFile(`${__dirname}/country/svg/${fileName}`)
    } else {
      res.status(404)
      res.send('not supported')
    }
  },
}

export default controller