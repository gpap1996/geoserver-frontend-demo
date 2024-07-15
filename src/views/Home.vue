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
    @click="handleMapClick"
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

    <ol-tile-layer :zIndex="1001">
      <ol-source-tile-wms
        ref="wmsSource"
        url="https://geo.buildspace.ewcloud.host/geoserver/wms"
        :extent="[-13884991, 2870341, -7455066, 6338219]"
        layers="ne:piraeus_districts_percentage_of_unemployed"
        serverType="geoserver"
        :transition="0"
        :params="{}"
      />
    </ol-tile-layer>

    <ol-zoom-control>
      <v-btn> Yes </v-btn>
    </ol-zoom-control>

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

    <ol-overlay
      v-if="featureInfo"
      :position="popupPosition"
      positioning="bottom-center"
    >
      <v-card max-width="500px" max-height="200px" style="overflow-y: scroll">
        <v-card-title>Block Information</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item v-for="(value, key) in featureInfo" :key="key">
              <v-list-item-title>{{ key }}:</v-list-item-title>
              <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closePopup">Close</v-btn>
        </v-card-actions>
      </v-card>
    </ol-overlay>
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
import { onMounted, reactive, ref } from "vue";
import { v4 as uuidv4 } from "uuid";

const wmsSource = ref(null);

const vectorSource = ref(null);
const center = ref([23.64639316995077, 37.948605588189125]);
const projection = ref("EPSG:4326");
const zoom = ref(14);

const drawEnable = ref(false);
const drawType = ref("Polygon");
const features = reactive([]);

const featureDialog = ref(false);
const featureToBeAdded = ref(null);
const featureName = ref(null);
const featureInfo = ref(null);
const popupPosition = ref(null);

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
  featureName.value = null;
};

//todo
const onFeatureEdit = () => {};

const onFeatureDelete = (feature) => {
  vectorSource.value.source.removeFeature(feature);
  const foundIndex = features.findIndex((el) => el.id_ == feature.id_);
  if (foundIndex !== -1) features.splice(foundIndex, 1);
};

const handleMapClick = (event) => {
  const viewResolution = event.map.getView().getResolution();
  const projection = event.map.getView().getProjection();
  const coordinate = event.coordinate;

  // First, check if we clicked on a feature
  const url = wmsSource.value.source.getFeatureInfoUrl(
    coordinate,
    viewResolution,
    projection,
    { INFO_FORMAT: "application/json", FEATURE_COUNT: 1 }
  );

  if (url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          featureInfo.value = data.features[0].properties;
          popupPosition.value = coordinate;
        } else {
          closePopup();
        }
      })
      .catch(() => {
        closePopup();
      });
  } else {
    closePopup();
  }
};

const closePopup = () => {
  featureInfo.value = null;
  popupPosition.value = null;
};

onMounted(() => {
  // console.log(wmsSource.value.source.getFeatureInfoUrl());
});
</script>

<style scoped>
/* .ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
} */

.ol-zoom {
  left: unset;
  right: 20px;
}
</style>
