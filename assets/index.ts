import googleIcon from './logos/g.webp'
import appleIcon from './logos/a.svg'
import githubIcon from './logos/git.svg'
import nullAsset from './null.svg'
import Body from './sapiens/body.svg'
import VegetrBody from './vegetr/body.svg'
import VegetrHideBody from './vegetr-hide/blank.png'
import SapiensBanner from './sapiens/banner.png'
import VegetrBanner from './vegetr/banner.png'
import VegetrHideBanner from './vegetr-hide/banner.png'
import RegisterArt from './register.png'

import {
  createRemoteSvg,
  createRemoteSvgWithoutInherit,
  RemoteSvgProps,
} from '@/components/remote-svg'
import { JSX } from 'react'

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME ?? ''

const createCloth = (n: number) =>
  DIST_DOMAIN
    ? createRemoteSvg(`https://${DIST_DOMAIN}/sapiens/clothes/cloth${n}.svg`)
    : null
const createHead = (n: number) =>
  DIST_DOMAIN
    ? createRemoteSvg(`https://${DIST_DOMAIN}/sapiens/heads/head${n}.svg`)
    : null
const createItem = (n: number) =>
  DIST_DOMAIN
    ? createRemoteSvgWithoutInherit(
        `https://${DIST_DOMAIN}/sapiens/items/item${n}.svg`,
      )
    : null

const Cloth1 = createCloth(1)
const Cloth2 = createCloth(2)
const Cloth3 = createCloth(3)
const Cloth4 = createCloth(4)
const Cloth5 = createCloth(5)
const Cloth6 = createCloth(6)
const Cloth7 = createCloth(7)
const Cloth8 = createCloth(8)
const Cloth9 = createCloth(9)
const Cloth10 = createCloth(10)
const Cloth11 = createCloth(11)
const Cloth12 = createCloth(12)
const Cloth13 = createCloth(13)
const Cloth14 = createCloth(14)
const Cloth15 = createCloth(15)
const Cloth16 = createCloth(16)

const Head1 = createHead(1)
const Head2 = createHead(2)
const Head3 = createHead(3)
const Head4 = createHead(4)
const Head5 = createHead(5)
const Head6 = createHead(6)
const Head7 = createHead(7)
const Head8 = createHead(8)
const Head9 = createHead(9)
const Head10 = createHead(10)
const Head11 = createHead(11)
const Head12 = createHead(12)
const Head13 = createHead(13)
const Head14 = createHead(14)
const Head15 = createHead(15)
const Head16 = createHead(16)
const Head17 = createHead(17)
const Head18 = createHead(18)
const Head19 = createHead(19)
const Head20 = createHead(20)

const Item1 = createItem(1)
const Item2 = createItem(2)
const Item3 = createItem(3)
const Item4 = createItem(4)
const Item5 = createItem(5)
const Item6 = createItem(6)
const Item7 = createItem(7)
const Item8 = createItem(8)
const Item9 = createItem(9)
const Item10 = createItem(10)
const Item11 = createItem(11)
const Item12 = createItem(12)
const Item13 = createItem(13)
const Item14 = createItem(14)
const Item15 = createItem(15)
const Item16 = createItem(16)
const Item17 = createItem(17)
const Item18 = createItem(18)
const Item19 = createItem(19)
const Item20 = createItem(20)
const Item21 = createItem(21)
const Item22 = createItem(22)
const Item23 = createItem(23)

export {
  googleIcon,
  appleIcon,
  githubIcon,
  RegisterArt,
  Body,
  VegetrBody,
  VegetrHideBody,
  SapiensBanner,
  VegetrBanner,
  VegetrHideBanner,
  Head1,
  Head2,
  Head3,
  Head4,
  Head5,
  Head6,
  Head7,
  Head8,
  Head9,
  Head10,
  Head11,
  Head12,
  Head13,
  Head14,
  Head15,
  Head16,
  Head17,
  Head18,
  Head19,
  Head20,
  Cloth1,
  Cloth2,
  Cloth3,
  Cloth4,
  Cloth5,
  Cloth6,
  Cloth7,
  Cloth8,
  Cloth9,
  Cloth10,
  Cloth11,
  Cloth12,
  Cloth13,
  Cloth14,
  Cloth15,
  Cloth16,
  Item1,
  Item2,
  Item3,
  Item4,
  Item5,
  Item6,
  Item7,
  Item8,
  Item9,
  Item10,
  Item11,
  Item12,
  Item13,
  Item14,
  Item15,
  Item16,
  Item17,
  Item18,
  Item19,
  Item20,
  Item21,
  Item22,
  Item23,
}
