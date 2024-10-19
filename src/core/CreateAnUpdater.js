export default function CreateAnUpdater(func) {
  const _this = this
  return function (...item) {
    func(...item)
    this.$mupdate()
  }
}