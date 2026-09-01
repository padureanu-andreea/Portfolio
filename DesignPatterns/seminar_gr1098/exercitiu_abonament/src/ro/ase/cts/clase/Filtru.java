package ro.ase.cts.clase;

public class Filtru {
    private final String titlu;
    private final String gen;
    private final int anAparitie;
    private final double rating;

    private Filtru(FiltruBuilder builder) {
        this.titlu = builder.titlu;
        this.gen = builder.gen;
        this.anAparitie = builder.anAparitie;
        this.rating = builder.anAparitie;
    }

    public String getTitlu() {
        return titlu;
    }

    public String getGen() {
        return gen;
    }

    public int getAnAparitie() {
        return anAparitie;
    }

    public double getRating() {
        return rating;
    }

    public static FiltruBuilder builder(){
        return new FiltruBuilder();
    }

    public static class FiltruBuilder implements AbstractSearchingFilter{
        private String titlu;
        private String gen;
        private int anAparitie;
        private double rating;

        public FiltruBuilder() {
        }

        @Override
        public Filtru build() {
            return new Filtru(this);
        }

        public FiltruBuilder setTitlu(String titlu) {
            this.titlu = titlu;
            return this;
        }

        public FiltruBuilder setGen(String gen) {
            this.gen = gen;
            return this;
        }

        public FiltruBuilder setAnAparitie(int anAparitie) {
            this.anAparitie = anAparitie;
            return this;
        }

        public FiltruBuilder setRating(double rating) {
            this.rating = rating;
            return this;
        }
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Filtru{");
        sb.append("titlu='").append(titlu).append('\'');
        sb.append(", gen='").append(gen).append('\'');
        sb.append(", anAparitie=").append(anAparitie);
        sb.append(", rating=").append(rating);
        sb.append('}');
        return sb.toString();
    }
}
