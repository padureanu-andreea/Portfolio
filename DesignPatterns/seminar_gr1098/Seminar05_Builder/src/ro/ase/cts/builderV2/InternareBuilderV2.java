package ro.ase.cts.builderV2;

public class InternareBuilderV2 implements AbstractBuilderV2 {

    private String nume;
    private boolean patRabatabil;
    private boolean micDejun;
    private boolean papuciCamera;
    private boolean halatInterior;

    public InternareBuilderV2() {
        super();
        this.nume = "";
        this.patRabatabil = false;
        this.micDejun = false;
        this.papuciCamera = false;
        this.halatInterior = false;
    }
//
//    @Override
//    public Internare build(String nume) {
//        return new Internare(nume, patRabatabil, papuciCamera, halatInterior, micDejun);
//    }



    @Override
    public Internare build(String nume) {
        return new Internare(nume, patRabatabil, micDejun, papuciCamera, halatInterior);
    }

    @Override
    public AbstractBuilderV2 setNume(String nume) {
        this.nume = nume;
        return this;
    }

    @Override
    public AbstractBuilderV2 setPatRabatabil(boolean patRabatabil) {
        this.patRabatabil = patRabatabil;
        return this;
    }

    @Override
    public AbstractBuilderV2 setPapuci(boolean papuci) {
        this.papuciCamera = papuci;
        return this;
    }

    @Override
    public AbstractBuilderV2 setHalat(boolean halat) {
        this.halatInterior = halat;
        return this;
    }

    @Override
    public AbstractBuilderV2 setMicDejun(boolean micDejun) {
        this.micDejun = micDejun;
        return this;
    }
}
