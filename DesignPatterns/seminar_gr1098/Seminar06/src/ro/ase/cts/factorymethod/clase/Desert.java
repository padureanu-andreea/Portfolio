package ro.ase.cts.factorymethod.clase;

public abstract class Desert implements FelDeMancare {
    protected float pretDesert;
    protected float gramajDesert;
    protected int caloriiDesert;

    public Desert(float pretDesert, float gramajDesert, int caloriiDesert) {
        this.pretDesert = pretDesert;
        this.gramajDesert = gramajDesert;
        this.caloriiDesert = caloriiDesert;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Desert{");
        sb.append("pretDesert=").append(pretDesert);
        sb.append(", gramajDesert=").append(gramajDesert);
        sb.append(", caloriiDesert=").append(caloriiDesert);
        sb.append('}');
        return sb.toString();
    }
}
