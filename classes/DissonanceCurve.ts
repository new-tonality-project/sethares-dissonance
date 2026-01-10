import {
    getSetharesDissonance,
    transpose,
    type SpectrumPartial,
    type DissonanceParams,
} from "../lib";

const DEFAULT_COLUMN_DELIMITER = ",";
const DEFAULT_ROW_DELIMITER = "\n";

export type DissonanceCurveOptions = DissonanceParams & {
    context: SpectrumPartial[];
    complement: SpectrumPartial[];
    stepCents?: number;
    startCents?: number;
    endCents?: number;
};

export class DissonanceCurve {
    private _data: Map<number, number> = new Map();

    public readonly startCents: NonNullable<
        DissonanceCurveOptions["startCents"]
    >;
    public readonly endCents: NonNullable<DissonanceCurveOptions["endCents"]>;
    public readonly stepCents: NonNullable<DissonanceCurveOptions["stepCents"]>;
    public readonly context: DissonanceCurveOptions["context"];
    public readonly complement: DissonanceCurveOptions["complement"];
    public readonly maxDissonance: number = 0;
    public readonly change: number = 0;

    constructor(opts: DissonanceCurveOptions) {
        const {
            context,
            complement,
            startCents,
            endCents,
            stepCents,
            ...dissonanceParams
        } = opts;

        this.context = context;
        this.complement = complement;

        this.startCents = startCents ?? 0;
        this.endCents = endCents ?? 1200;
        this.stepCents = stepCents ?? 1;

        if (this.startCents > this.endCents)
            throw Error("startCents should be less or equal to endCents");
        if (this.stepCents <= 0)
            throw Error("precision should be greater than zero");

        for (
            let cent = this.startCents;
            cent <= this.endCents;
            cent += this.stepCents
        ) {
            const dissonance = getSetharesDissonance(
                this.context,
                transpose(this.complement, cent),
                dissonanceParams
            );

            if (dissonance > this.maxDissonance)
                this.maxDissonance = dissonance;

            this._data.set(cent, dissonance);
        }
    }

    public get points() {
        return Array.from(this._data.entries()).sort((a, b) => a[0] - b[0]);
    }

    public get(cent: number) {
        return this._data.get(cent);
    }

    private getRowString(
        row: Array<number | string>,
        delimiter: string = DEFAULT_COLUMN_DELIMITER
    ) {
        if (row.length === 0) return "";

        let result = `${row[0]}`;

        for (let i = 1; i < row.length; i += 1) {
            result += `${delimiter}${row[i]}`;
        }

        return result;
    }

    public toString(
        columnDelimiter: string = DEFAULT_COLUMN_DELIMITER,
        rowDelimiter: string = DEFAULT_ROW_DELIMITER
    ) {
        if (this._data.size === 0) return "";

        const headerRow = this.getRowString(
            ["Interval (cents)", "Sensory dissonance"],
            columnDelimiter
        );

        let result = headerRow + rowDelimiter;

        for (const point of this.points) {
            result += this.getRowString(point, columnDelimiter) + rowDelimiter;
        }

        return result;
    }

    public toCsvFileBuffer(
        columnDelimiter: string = DEFAULT_COLUMN_DELIMITER,
        rowDelimiter: string = DEFAULT_ROW_DELIMITER
    ) {
        const content = this.toString(columnDelimiter, rowDelimiter);

        // Return UTF-8 BOM + content as Buffer for Node.js writeFileSync
        return Buffer.concat([
            Buffer.from([0xef, 0xbb, 0xbf]),
            Buffer.from(content, "utf-8"),
        ]);
    }
}
