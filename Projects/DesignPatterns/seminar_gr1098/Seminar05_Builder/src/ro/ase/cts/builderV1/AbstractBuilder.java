package ro.ase.cts.builderV1;

public interface AbstractBuilder {
    Internare build();

    AbstractBuilder setNume(String nume);
    AbstractBuilder setPatRabatabil(boolean patRabatabil);
    AbstractBuilder setPapuci(boolean papuci);
    AbstractBuilder setHalat(boolean halat);
    AbstractBuilder setMicDejun(boolean micDejun);

}
