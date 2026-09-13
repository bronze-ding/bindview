import createID from "./tools/createID"
import h from "./core/h"
import createApp from "./tools/createApp"
import send from "./tools/send"
import propsType from "./tools/propsType"
import devtools, { getDevtoolsHook, emitDevtools, isDevtoolsEnabled } from "./tools/devtools"

import Bindview from "./core/Bindview"

export default Bindview

export {
  createID,
  createApp,
  h,
  send,
  propsType,
  Bindview,
  devtools,
  getDevtoolsHook,
  emitDevtools,
  isDevtoolsEnabled
}