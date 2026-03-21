function formatPrice(value) {
  return `Rs. ${new Intl.NumberFormat('en-IN').format(value)}`
}

export { formatPrice }
