import { getSetharesDissonance, transpose, type Spectrum } from "../lib/utils";

type DissonanceCurveOptions = {
  context: Spectrum;
  compliment: Spectrum;
  precision?: number;
  rangeMin?: number;
  rangeMax?: number;
};

export class DissonanceCurve {
  private _data: Map<number, number> = new Map();
  private step: number;

  public readonly rangeMin: NonNullable<DissonanceCurveOptions["rangeMin"]>;
  public readonly rangeMax: NonNullable<DissonanceCurveOptions["rangeMax"]>;
  public readonly precision: NonNullable<DissonanceCurveOptions["precision"]>;
  public readonly context: DissonanceCurveOptions["context"];
  public readonly compliment: DissonanceCurveOptions["compliment"];
  public readonly maxDissonance: number = 0;
  public readonly change: number = 0;

  constructor(opts: DissonanceCurveOptions) {
    this.context = opts.context;
    this.compliment = opts.compliment;

    this.rangeMin = opts.rangeMin ?? 0;
    this.rangeMax = opts.rangeMax ?? 1200;
    this.precision = opts.precision ?? 1;

    if (this.rangeMin > this.rangeMax)
      throw Error("rangeMin should be less or equal to rangeMax");
    if (this.precision <= 0)
      throw Error("precision should be greater than zero");

    this.step =
      (this.rangeMax - this.rangeMin) / (this.rangeMax * this.precision);

    for (let cent = this.rangeMin; cent <= this.rangeMax; cent += this.step) {
      const dissonance = getSetharesDissonance(
        this.context,
        transpose(this.compliment, cent)
      );

      if (dissonance > this.maxDissonance) this.maxDissonance = dissonance;

      this._data.set(cent, dissonance);
    }
  }

  public get points() {
    return Array.from(this._data.entries()).sort((a, b) => a[0] - b[0]);
  }

  private getRowString(row: Array<number | string>) {
    if (row.length === 0) return "";

    let result = `${row[0]}`;

    for (let i = 1; i < row.length; i += 1) {
      result += `\t${row[i]}`;
    }

    return result;
  }

  public toFileString() {
    if (this._data.size === 0) return "";

    const headerRow = this.getRowString([
      "Interval (cents)",
      "Sensory dissonance",
    ]);

    let result = headerRow + "\n";

    for (const point of this.points) {
      result += this.getRowString(point);
    }

    return result;
  }
}
