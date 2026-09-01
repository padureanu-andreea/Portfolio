package ro.ase.cts.builderV2;

public interface AbstractBuilderV2 {
    Internare build(String nume);

    AbstractBuilderV2 setNume(String nume);
    AbstractBuilderV2 setPatRabatabil(boolean patRabatabil);
    AbstractBuilderV2 setPapuci(boolean papuci);
    AbstractBuilderV2 setHalat(boolean halat);
    AbstractBuilderV2 setMicDejun(boolean micDejun);

}
