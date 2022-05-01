


/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/* global ListAdapter */
PersonsAdapter.prototype = Object.create(ListAdapter.prototype);
PersonsAdapter.prototype.constructor = PersonsAdapter;

function PersonsAdapter(list, callback) {
    ListAdapter.call(this, list, callback);
}

PersonsAdapter.prototype.bindData = function (pos, li) {
    ListAdapter.prototype.bindData.call(this, pos, li);
    let item = this.getItem(pos);
    let personImageView = this.getChildView(pos,"person_img");
    let personNameView = this.getChildView(pos,"person_name");
    let personPhoneView = this.getChildView(pos,"person_phone");

console.log(personNameView, "\n", personPhoneView,"\n", personImageView);
    personImageView.src = getImagePath(item.src);
    personNameView.textContent = item.name;
    personPhoneView.textContent = item.phone;

};


