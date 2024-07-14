<template>
  <div style="position: absolute; bottom: 20px; right: 0; z-index: 99">
    <div class="bg-white rounded-sm ma-2 px-2">
      <v-btn
        size="small"
        variant="plain"
        color="primary"
        icon="fa-regular fa-circle"
        @click="
          drawType = 'Circle';
          drawEnable = true;
        "
      ></v-btn>
      <v-btn
        size="small"
        variant="plain"
        color="primary"
        icon="fa fa-draw-polygon"
        @click="
          drawType = 'Polygon';
          drawEnable = true;
        "
      >
      </v-btn>
    </div>
  </div>

  <div
    v-if="features.length > 0"
    style="
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 99;
      max-width: 250px;
      min-width: 250px;
    "
    class="bg-white pa-4 rounded"
  >
    <div class="text-body-1">Features</div>
    <v-divider></v-divider>
    <div
      class="d-flex flex-column align-start justify-center mt-2"
      v-for="(feature, i) in features"
      :key="feature.id_"
    >
      <div class="d-flex align-center" style="width: 100%">
        <div class="text-body-2">
          {{ `${i + 1})  ${feature?.name}` }}
        </div>
        <v-btn
          variant="plain"
          color="error"
          size="x-small"
          icon="fa fa-trash"
          class="ml-auto"
          @click="onFeatureDelete(feature)"
        >
        </v-btn>
      </div>
    </div>
  </div>

  <ol-map
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100vh; width: 100vw"
  >
    <ol-view
      ref="view"
      :center="center"
      :zoom="zoom"
      :projection="projection"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-zoom-control position="top-right" />

    <ol-vector-layer>
      <ol-source-vector :projection="projection" ref="vectorSource">
        <ol-interaction-draw
          v-if="drawEnable"
          :type="drawType"
          @drawend="drawend"
          @drawstart="drawstart"
        >
          <ol-style>
            <ol-style-stroke color="#0367A5" :width="2"></ol-style-stroke>
            <ol-style-fill color="transparent"></ol-style-fill>
            <ol-style-circle :radius="5">
              <ol-style-fill color="#0367A5" />
              <ol-style-stroke color="#0367A5" :width="2" />
            </ol-style-circle>
          </ol-style>
        </ol-interaction-draw>
      </ol-source-vector>
    </ol-vector-layer>
  </ol-map>

  <v-dialog v-model="featureDialog" v-if="featureDialog" maxWidth="350px">
    <v-card class="pa-4">
      <v-form @submit.prevent="onFeatureAdd" class="d-flex flex-column">
        <v-text-field label="Feature Name" v-model="featureName">
        </v-text-field>
        <div class="align-self-center">
          <v-btn type="submit" color="primary" class="mr-2"> Add </v-btn>

          <v-btn
            color="error"
            variant="outlined"
            @click="
              onFeatureDelete(featureToBeAdded);
              featureDialog = false;
            "
          >
            Reset
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, ref } from "vue";
import { v4 as uuidv4 } from "uuid";

const vectorSource = ref(null);
const center = ref([40, 40]);
const projection = ref("EPSG:4326");
const zoom = ref(8);

const drawEnable = ref(false);
const drawType = ref("Polygon");
const features = reactive([]);

const featureDialog = ref(false);
const featureToBeAdded = ref(null);
const featureName = ref(null);

const drawstart = (event) => {
  console.log(event);
};

const drawend = (event) => {
  drawEnable.value = false;
  const feature = event.feature;

  //generate a feature id
  feature.id_ = uuidv4();
  featureToBeAdded.value = feature;
  featureDialog.value = true;
  //   features.push(feature);

  drawEnable.value = false;
};

const onFeatureAdd = () => {
  featureToBeAdded.value.name = featureName.value;
  features.push(featureToBeAdded.value);
  featureDialog.value = false;
};

const onFeatureEdit = () => {};

const onFeatureDelete = (feature) => {
  vectorSource.value.source.removeFeature(feature);
  const foundIndex = features.findIndex((el) => el.id_ == feature.id_);
  if (foundIndex !== -1) features.splice(foundIndex, 1);
};
</script>

<style>
.ol-zoom {
  left: unset;
  right: 20px;
}
</style>
