---
sidebar_position: -{{DIVE_NUMBER}}
---

# #{{DIVE_NUMBER}}

<iframe src="https://www.google.com/maps?q={{LATITUDE}},{{LONGITUDE}}&z=15&output=embed" height="200" width="400" style={{ borderRadius: '20px', marginBottom: '1rem' }}/>

<div>
  <table>
    <tbody>
      <tr><td><strong>Date</strong></td><td>{{DATE}}</td></tr>
      <tr><td><strong>Dive site</strong></td><td>{{DIVE_SITE}}</td></tr>
      <tr><td><strong>Depth</strong></td><td>{{DEPTH}} m</td></tr>
      <tr><td><strong>Dive time</strong></td><td>{{DIVE_TIME}} min</td></tr>
      <tr><td><strong>Tank</strong></td><td>{{TANK_MATERIAL}} ({{TANK_VOLUME}} l)</td></tr>
      <tr><td><strong>Gas</strong></td><td>{{GAS}}</td></tr>
      <tr><td><strong>Lowest temperature</strong></td><td>{{LOWEST_TEMPERATURE}} °C</td></tr>
      <tr><td><strong>Highest temperature</strong></td><td>{{HIGHEST_TEMPERATURE}} °C</td></tr>
      <tr><td><strong>Suit</strong></td><td>{{SUIT}}</td></tr>
      <tr><td><strong>Weight</strong></td><td>{{WEIGHT}} kg</td></tr>
      <tr><td><strong>Visibility</strong></td><td>{{VISIBILITY}} m</td></tr>
    </tbody>
  </table>
</div>