package ro.ase.cts.clase.chainOfResponsability;

public class Document {
    protected boolean semnatura;
    protected boolean completitudine;
    protected boolean format;
    protected boolean anexa;

    public Document(boolean semnatura, boolean completitudine, boolean format, boolean anexa) {
        this.semnatura = semnatura;
        this.completitudine = completitudine;
        this.format = format;
        this.anexa = anexa;
    }
}
