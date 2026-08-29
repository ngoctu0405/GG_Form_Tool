export function random_option(options, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;

  for (let i = 0; i < options.length; i++) {
    random -= weights[i];

    if (random < 0) {
      return options[i];
    }
  }
}
