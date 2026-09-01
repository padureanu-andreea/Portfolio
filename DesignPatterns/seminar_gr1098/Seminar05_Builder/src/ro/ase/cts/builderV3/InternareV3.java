package ro.ase.cts.builderV3;

public class InternareV3 {
    private String numePacient;
    private boolean patRabatabil;
    private boolean micDejun;
    private boolean papuciCamera;
    private boolean halatInterior;

    private InternareV3(InternareBuilderV3 builder){
        this.numePacient = builder.numePacient;
        this.patRabatabil = builder.patRabatabil;
        this.micDejun = builder.micDejun;
        this.papuciCamera = builder.papuciCamera;
        this.halatInterior = builder.halatInterior;
    }

    public String getNumePacient() {
        return numePacient;
    }

    public boolean isPatRabatabil() {
        return patRabatabil;
    }

    public boolean isMicDejun() {
        return micDejun;
    }

    public boolean isPapuciCamera() {
        return papuciCamera;
    }

    public boolean isHalatInterior() {
        return halatInterior;
    }

    public static InternareBuilderV3 builderV3(String numePacient){
        return new InternareBuilderV3(numePacient);
    }

    public static class InternareBuilderV3 implements AbstractBuilderV3{
        private String numePacient;

        private boolean patRabatabil;
        private boolean micDejun;
        private boolean papuciCamera;
        private boolean halatInterior;

        public InternareBuilderV3(String numePacient) {
            this.numePacient = numePacient;
        }

        public InternareBuilderV3 setNumePacient(String numePacient) {
            this.numePacient = numePacient;
            return this;
        }

        public InternareBuilderV3 setPatRabatabil(boolean patRabatabil) {
            this.patRabatabil = patRabatabil;
            return this;
        }

        public InternareBuilderV3 setMicDejun(boolean micDejun) {
            this.micDejun = micDejun;
            return this;
        }

        public InternareBuilderV3 setPapuciCamera(boolean papuciCamera) {
            this.papuciCamera = papuciCamera;
            return this;
        }

        public InternareBuilderV3 setHalatInterior(boolean halatInterior) {
            this.halatInterior = halatInterior;
            return this;
        }

        @Override
        public InternareV3 build() {
            return new InternareV3(this);
        }
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("InternareV3{");
        sb.append("numePacient='").append(numePacient).append('\'');
        sb.append(", patRabatabil=").append(patRabatabil);
        sb.append(", micDejun=").append(micDejun);
        sb.append(", papuciCamera=").append(papuciCamera);
        sb.append(", halatInterior=").append(halatInterior);
        sb.append('}');
        return sb.toString();
    }
}
