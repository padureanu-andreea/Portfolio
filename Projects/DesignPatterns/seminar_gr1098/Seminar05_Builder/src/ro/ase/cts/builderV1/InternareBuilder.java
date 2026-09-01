package ro.ase.cts.builderV1;

public class InternareBuilder implements AbstractBuilder {
    private Internare internare;

    public InternareBuilder(String numePacient) {
        internare = new Internare(numePacient, false, false, false, false);
    }

    @Override
    public Internare build() {
        return this.internare;
    }

    @Override
    public AbstractBuilder setNume(String nume) {
        this.internare.setNumePacient(nume);
        return this;
    }

    @Override
    public AbstractBuilder setPatRabatabil(boolean patRabatabil) {
        this.internare.setPatRabatabil(patRabatabil);
        return this;
    }

    @Override
    public AbstractBuilder setPapuci(boolean papuci) {
        this.internare.setPapuciCamera(papuci);
        return this;
    }

    @Override
    public AbstractBuilder setHalat(boolean halat) {
        this.internare.setHalatInterior(halat);
        return this;
    }

    @Override
    public AbstractBuilder setMicDejun(boolean micDejun) {
        this.internare.setMicDejun(micDejun);
        return this;
    }
}
