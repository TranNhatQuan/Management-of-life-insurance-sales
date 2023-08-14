
const { Insurance_type, Catalog, Post_type } = require("../../models");
let listType = null
let listCatalog = null
let listPostType = null

const getData = async () => {
  if (listType == null) {
    listType = await Insurance_type.findAll({
      where: {
        isDel: 0
      },
      attributes: ['name', 'idInsurance_type','info'],
    })
  }
  if (listCatalog == null) {
    listCatalog = await Catalog.findAll({
      attributes: ['name', 'idCatalog','info'],
    })
  }
  if (listPostType == null) {
    listPostType = await Post_type.findAll({
      where: {
        isDel: 0
      },
      attributes: ['name', 'idPost_type','info'],
    })
  }

  return { listType, listPostType, listCatalog }


}
const updateData = async () => {

  listType = await Insurance_type.findAll({
    where: {
      isDel: 0
    },
    attributes: ['name', 'idInsurance_type'],
  })


  listCatalog = await Catalog.findAll({
    attributes: ['name', 'idCatalog'],
  })


  listPostType = await Post_type.findAll({
    where: {
      isDel: 0
    },
    attributes: ['name', 'idPost_type'],
  })


  return true


}
module.exports = {
  getData, updateData
}