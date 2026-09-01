package ro.ase.cts.factorymethod.clase;

public abstract class Supa implements FelDeMancare {
    protected float pretSupa;
    protected float gramajSupa;

    public Supa(float pretSupa, float gramajSupa) {
        this.pretSupa = pretSupa;
        this.gramajSupa = gramajSupa;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Supa{");
        sb.append("pret=").append(pretSupa);
        sb.append(", gramaj=").append(gramajSupa);
        sb.append('}');
        return sb.toString();
    }
}
